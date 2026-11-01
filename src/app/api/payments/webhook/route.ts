import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const webhookHeaderSchema = z.object({
  event: z.string().min(1).max(100)
}).passthrough();

const paymentEntitySchema = z.object({
  id: z.string().min(1).max(128),
  order_id: z.string().min(1).max(128),
  amount: z.number().int().positive(),
  currency: z.string().length(3)
}).passthrough();

function isDuplicateEvent(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2002";
}

export async function POST(request: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ error: "Webhook unavailable." }, { status: 503 });

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > 1_000_000) return NextResponse.json({ error: "Webhook payload is too large." }, { status: 413 });

  const raw = await request.text();
  const signature = request.headers.get("x-razorpay-signature") ?? "";
  const expected = createHmac("sha256", secret).update(raw).digest("hex");
  const actualBytes = Buffer.from(signature);
  const expectedBytes = Buffer.from(expected);
  if (actualBytes.length !== expectedBytes.length || !timingSafeEqual(actualBytes, expectedBytes)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  const eventId = request.headers.get("x-razorpay-event-id");
  if (!eventId || eventId.length > 255) {
    return NextResponse.json({ error: "Missing or invalid event id." }, { status: 400 });
  }

  let rawEvent: unknown;
  try {
    rawEvent = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid webhook payload." }, { status: 400 });
  }
  const header = webhookHeaderSchema.safeParse(rawEvent);
  if (!header.success) return NextResponse.json({ error: "Invalid webhook payload." }, { status: 400 });

  const handlesCapture = header.data.event === "payment.captured";
  const handlesFailure = header.data.event === "payment.failed";
  const entityResult = z.object({
    payment: z.object({ entity: paymentEntitySchema })
  }).safeParse((rawEvent as Record<string, unknown>).payload);
  if ((handlesCapture || handlesFailure) && !entityResult.success) {
    return NextResponse.json({ error: "Invalid payment event payload." }, { status: 400 });
  }

  const entity = entityResult.success ? entityResult.data.payment.entity : null;
  try {
    await prisma.$transaction(async (tx) => {
      if (await tx.webhookEvent.findUnique({ where: { id: eventId } })) return;
      await tx.webhookEvent.create({ data: { id: eventId } });

      if (!entity || (!handlesCapture && !handlesFailure)) return;
      const order = await tx.order.findUnique({
        where: { razorpayOrderId: entity.order_id },
        include: { items: true, payment: true }
      });
      if (!order || !order.payment) return;
      if (entity.currency !== "INR"
        || entity.amount !== order.totalPaise
        || entity.amount !== order.payment.amountPaise) {
        throw new Error("PAYMENT_AMOUNT_MISMATCH");
      }

      const eligiblePaymentStatuses = ["created", "authorized"];
      if (order.status !== "PENDING" || !eligiblePaymentStatuses.includes(order.payment.status)) return;

      if (handlesCapture) {
        const orderChanged = await tx.order.updateMany({
          where: { id: order.id, status: "PENDING" },
          data: { status: "PAID" }
        });
        if (orderChanged.count !== 1) return;

        const paymentChanged = await tx.payment.updateMany({
          where: { orderId: order.id, status: { in: eligiblePaymentStatuses } },
          data: { status: "captured", providerPaymentId: entity.id }
        });
        if (paymentChanged.count !== 1) throw new Error("PAYMENT_STATE_CHANGED");

        for (const item of order.items) {
          const deducted = await tx.productVariant.updateMany({
            where: {
              id: item.variantId,
              stock: { gte: item.quantity },
              reserved: { gte: item.quantity }
            },
            data: {
              stock: { decrement: item.quantity },
              reserved: { decrement: item.quantity }
            }
          });
          if (deducted.count !== 1) throw new Error("INVENTORY_RESERVATION_MISMATCH");
        }

        const cart = await tx.cart.findUnique({ where: { userId: order.userId }, select: { id: true } });
        if (cart) {
          for (const item of order.items) {
            const cartItem = await tx.cartItem.findUnique({
              where: { cartId_variantId: { cartId: cart.id, variantId: item.variantId } }
            });
            if (!cartItem) continue;

            const remainingQuantity = cartItem.quantity - item.quantity;
            if (remainingQuantity > 0) {
              await tx.cartItem.updateMany({
                where: { id: cartItem.id, quantity: cartItem.quantity },
                data: { quantity: remainingQuantity }
              });
            } else {
              await tx.cartItem.deleteMany({ where: { id: cartItem.id } });
            }
          }
        }
      } else {
        const orderChanged = await tx.order.updateMany({
          where: { id: order.id, status: "PENDING" },
          data: { status: "CANCELLED" }
        });
        if (orderChanged.count !== 1) return;

        const paymentChanged = await tx.payment.updateMany({
          where: { orderId: order.id, status: { in: eligiblePaymentStatuses } },
          data: { status: "failed" }
        });
        if (paymentChanged.count !== 1) throw new Error("PAYMENT_STATE_CHANGED");

        for (const item of order.items) {
          const released = await tx.productVariant.updateMany({
            where: { id: item.variantId, reserved: { gte: item.quantity } },
            data: { reserved: { decrement: item.quantity } }
          });
          if (released.count !== 1) throw new Error("INVENTORY_RESERVATION_MISMATCH");
        }
      }
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    if (isDuplicateEvent(error)) return NextResponse.json({ received: true });
    if (error instanceof Error && error.message === "PAYMENT_AMOUNT_MISMATCH") {
      console.error("[payment-webhook] Payment amount or currency did not match the order.");
      return NextResponse.json({ error: "Payment does not match the order." }, { status: 400 });
    }
    console.error("[payment-webhook]", error);
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }
}
