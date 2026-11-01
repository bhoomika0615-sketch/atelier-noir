import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { userOrResponse } from "@/lib/guards";
import { assertSameOrigin, jsonError, serverError } from "@/lib/http";
import { enforceRateLimit } from "@/lib/rate-limit";
import { verifyRazorpayCheckoutSignature } from "@/lib/payments";

const verificationSchema = z.object({
  orderId: z.string().cuid(),
  razorpay_order_id: z.string().min(1).max(128),
  razorpay_payment_id: z.string().min(1).max(128),
  razorpay_signature: z.string().regex(/^[a-f0-9]{64}$/i)
}).strict();

const gatewayPaymentSchema = z.object({
  id: z.string(),
  order_id: z.string(),
  amount: z.number().int(),
  currency: z.string(),
  status: z.string()
}).passthrough();

export async function POST(request: Request) {
  try {
    const user = await userOrResponse();
    if (user instanceof NextResponse) return user;
    if (!assertSameOrigin(request)) return jsonError("Invalid request origin.", 403);
    if (!await enforceRateLimit(`payment-verify:${user.id}`, 10, 300)) {
      return jsonError("Too many payment verification attempts.", 429);
    }

    const parsed = verificationSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return jsonError("Invalid payment verification details.", 400);
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = parsed.data;
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) return jsonError("Online payments are not configured yet.", 503);
    if (!verifyRazorpayCheckoutSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature, keySecret)) {
      return jsonError("Payment signature could not be verified.", 400);
    }

    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: user.id, razorpayOrderId: razorpay_order_id },
      include: { payment: true }
    });
    if (!order?.payment) return jsonError("Order not found.", 404);
    if (order.status !== "PENDING" && order.status !== "PAID") {
      return jsonError("This order is no longer awaiting payment.", 409);
    }

    const authorization = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
    const response = await fetch(
      `https://api.razorpay.com/v1/payments/${encodeURIComponent(razorpay_payment_id)}`,
      {
        headers: { Authorization: `Basic ${authorization}` },
        cache: "no-store",
        signal: AbortSignal.timeout(10000)
      }
    );
    if (!response.ok) return jsonError("The payment provider could not confirm this payment yet.", 502);

    const gatewayPayment = gatewayPaymentSchema.safeParse(await response.json().catch(() => null));
    if (!gatewayPayment.success) return jsonError("The payment provider returned an invalid response.", 502);
    const payment = gatewayPayment.data;
    if (payment.id !== razorpay_payment_id
      || payment.order_id !== razorpay_order_id
      || payment.amount !== order.totalPaise
      || payment.amount !== order.payment.amountPaise
      || payment.currency !== "INR"
      || (payment.status !== "authorized" && payment.status !== "captured")) {
      return jsonError("The payment does not match this order.", 409);
    }

    if (order.payment.status === "created") {
      const updated = await prisma.payment.updateMany({
        where: { orderId: order.id, status: "created" },
        data: { status: "authorized", providerPaymentId: payment.id }
      });
      if (updated.count !== 1) {
        const latest = await prisma.payment.findUnique({ where: { orderId: order.id } });
        if (!latest || latest.providerPaymentId !== payment.id || !["authorized", "captured"].includes(latest.status)) {
          return jsonError("Payment state changed. Check your order history before trying again.", 409);
        }
      }
    } else if (order.payment.providerPaymentId !== payment.id
      || !["authorized", "captured"].includes(order.payment.status)) {
      return jsonError("Payment state changed. Check your order history before trying again.", 409);
    }

    return NextResponse.json({
      verified: true,
      orderNumber: order.orderNumber,
      paymentStatus: payment.status,
      orderStatus: order.status
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return serverError(error);
  }
}
