import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { userOrResponse } from "@/lib/guards";
import { assertSameOrigin, jsonError, serverError } from "@/lib/http";
import { enforceRateLimit } from "@/lib/rate-limit";
import { shippingAddressSchema } from "@/lib/validation";

type CreatedOrder = { id: string; orderNumber: string };

async function releasePendingOrder(orderId: string) {
  await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true }
    });
    if (!order || order.status !== "PENDING") return;

    for (const item of order.items) {
      const released = await tx.productVariant.updateMany({
        where: { id: item.variantId, reserved: { gte: item.quantity } },
        data: { reserved: { decrement: item.quantity } }
      });
      if (released.count !== 1) throw new Error("RESERVATION_RELEASE_FAILED");
    }

    await tx.payment.updateMany({
      where: { orderId, status: "created" },
      data: { status: "failed" }
    });
    await tx.order.updateMany({
      where: { id: orderId, status: "PENDING" },
      data: { status: "CANCELLED" }
    });
  });
}

function isValidRazorpayOrder(value: unknown, orderNumber: string, amount: number): value is { id: string } {
  if (typeof value !== "object" || value === null || !("id" in value) || !("receipt" in value) || !("amount" in value) || !("currency" in value)) {
    return false;
  }
  return typeof value.id === "string" && value.id.length > 0
    && value.receipt === orderNumber && value.amount === amount && value.currency === "INR";
}

export async function POST(request: Request) {
  let createdOrder: CreatedOrder | null = null;
  try {
    const user = await userOrResponse();
    if (user instanceof NextResponse) return user;
    if (!assertSameOrigin(request)) return jsonError("Invalid request origin.", 403);
    if (!await enforceRateLimit(`checkout:${user.id}`, 5, 300)) {
      return jsonError("Please wait before trying again.", 429);
    }

    const body = await request.json().catch(() => null);
    const addressResult = shippingAddressSchema.safeParse(body?.address);
    if (!addressResult.success) return jsonError("A valid shipping address is required.", 400);
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return jsonError("Online payments are not configured yet.", 503);
    }

    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: { items: { include: { variant: { include: { product: true } } } } }
    });
    if (!cart?.items.length) return jsonError("Your bag is empty.", 400);
    if (cart.items.some((item) => !item.variant.product.published)) {
      return jsonError("A product in your bag is no longer available. Update your bag and try again.", 409);
    }

    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.variant.product.pricePaise * item.quantity,
      0
    );
    if (!Number.isSafeInteger(subtotal) || subtotal < 100) {
      return jsonError("The order total is invalid.", 400);
    }

    const orderNumber = `AN-${Date.now().toString(36).toUpperCase()}-${randomUUID().slice(0, 6).toUpperCase()}`;
    createdOrder = await prisma.$transaction(async (tx) => {
      for (const item of cart.items) {
        const reserved = await tx.$executeRaw`
          UPDATE "ProductVariant"
          SET "reserved" = "reserved" + ${item.quantity}
          WHERE "id" = ${item.variantId} AND "stock" - "reserved" >= ${item.quantity}
        `;
        if (reserved !== 1) throw new Error("STOCK_UNAVAILABLE");
      }

      return tx.order.create({
        data: {
          orderNumber,
          userId: user.id,
          subtotalPaise: subtotal,
          totalPaise: subtotal,
          shippingAddress: addressResult.data,
          items: {
            create: cart.items.map((item) => ({
              productId: item.variant.productId,
              variantId: item.variantId,
              productName: item.variant.product.name,
              sku: item.variant.sku,
              size: item.variant.size,
              quantity: item.quantity,
              unitPricePaise: item.variant.product.pricePaise
            }))
          }
        },
        select: { id: true, orderNumber: true }
      });
    });

    const authorization = Buffer.from(
      `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
    ).toString("base64");
    const paymentResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${authorization}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        amount: subtotal,
        currency: "INR",
        receipt: createdOrder.orderNumber,
        notes: { orderId: createdOrder.id }
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(10000)
    });
    if (!paymentResponse.ok) throw new Error("PAYMENT_PROVIDER_ERROR");

    const providerOrder: unknown = await paymentResponse.json().catch(() => null);
    if (!isValidRazorpayOrder(providerOrder, createdOrder.orderNumber, subtotal)) {
      throw new Error("PAYMENT_PROVIDER_ERROR");
    }

    await prisma.$transaction([
      prisma.order.update({
        where: { id: createdOrder.id },
        data: { razorpayOrderId: providerOrder.id }
      }),
      prisma.payment.create({
        data: { orderId: createdOrder.id, status: "created", amountPaise: subtotal }
      })
    ]);

    return NextResponse.json({
      orderId: createdOrder.id,
      orderNumber: createdOrder.orderNumber,
      razorpayOrderId: providerOrder.id,
      amount: subtotal,
      currency: "INR",
      keyId: process.env.RAZORPAY_KEY_ID
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (createdOrder) {
      try {
        await releasePendingOrder(createdOrder.id);
      } catch (cleanupError) {
        console.error("[checkout-reservation-cleanup]", cleanupError);
        return serverError(cleanupError);
      }
    }
    if (error instanceof Error && error.message === "STOCK_UNAVAILABLE") {
      return jsonError("One or more items are no longer available.", 409);
    }
    if (error instanceof Error && error.message === "PAYMENT_PROVIDER_ERROR") {
      console.error("[checkout-provider]", error.message);
      return jsonError("The payment service could not start checkout. Your reserved stock has been released.", 502);
    }
    if (error instanceof Error && error.name === "TimeoutError") {
      console.error("[checkout-provider]", error.message);
      return jsonError("The payment service timed out. Your reserved stock has been released.", 502);
    }
    return serverError(error);
  }
}
