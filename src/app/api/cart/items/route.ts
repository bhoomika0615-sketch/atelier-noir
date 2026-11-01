import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { userOrResponse } from "@/lib/guards";
import { cartItemDeleteSchema, cartItemUpdateSchema, cartSchema } from "@/lib/validation";
import { assertSameOrigin, jsonError, serverError } from "@/lib/http";
import { enforceRateLimit } from "@/lib/rate-limit";

async function requestBody(request: Request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

async function authorizeCartWrite(request: Request) {
  const user = await userOrResponse();
  if (user instanceof NextResponse) return user;
  if (!assertSameOrigin(request)) return jsonError("Invalid request origin.", 403);
  if (!await enforceRateLimit(`cart:${user.id}`, 30, 60)) return jsonError("Too many requests.", 429);
  return user;
}

export async function POST(request: Request) {
  try {
    const user = await authorizeCartWrite(request);
    if (user instanceof NextResponse) return user;

    const parsed = cartSchema.safeParse(await requestBody(request));
    if (!parsed.success) return jsonError("Invalid cart item.", 400);

    try {
      await prisma.$transaction(async (tx) => {
        const variant = await tx.productVariant.findUnique({
          where: { id: parsed.data.variantId },
          include: { product: true }
        });
        if (!variant || !variant.product.published) throw new Error("CART_UNAVAILABLE");

        const cart = await tx.cart.upsert({
          where: { userId: user.id },
          create: { userId: user.id },
          update: {}
        });
        const key = { cartId_variantId: { cartId: cart.id, variantId: variant.id } };
        const existing = await tx.cartItem.findUnique({ where: key });
        const quantity = (existing?.quantity ?? 0) + parsed.data.quantity;
        if (quantity > 5) throw new Error("CART_QUANTITY_LIMIT");
        if (variant.stock - variant.reserved < quantity) throw new Error("CART_UNAVAILABLE");

        await tx.cartItem.upsert({
          where: key,
          create: { cartId: cart.id, variantId: variant.id, quantity },
          update: { quantity }
        });
      });
    } catch (error) {
      if (error instanceof Error && error.message === "CART_QUANTITY_LIMIT") {
        return jsonError("A maximum of five of this size can be added to your bag.", 409);
      }
      if (error instanceof Error && error.message === "CART_UNAVAILABLE") {
        return jsonError("This size is currently unavailable in the requested quantity.", 409);
      }
      throw error;
    }

    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return serverError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await authorizeCartWrite(request);
    if (user instanceof NextResponse) return user;

    const parsed = cartItemUpdateSchema.safeParse(await requestBody(request));
    if (!parsed.success) return jsonError("Invalid cart update.", 400);

    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      select: { id: true }
    });
    if (!cart) return jsonError("Cart item not found.", 404);

    const item = await prisma.cartItem.findFirst({
      where: { id: parsed.data.cartItemId, cartId: cart.id },
      include: { variant: true }
    });
    if (!item) return jsonError("Cart item not found.", 404);
    if (
      parsed.data.quantity > item.quantity &&
      item.variant.stock - item.variant.reserved < parsed.data.quantity
    ) {
      return jsonError("This size is currently unavailable in the requested quantity.", 409);
    }

    await prisma.cartItem.update({
      where: { id: item.id },
      data: { quantity: parsed.data.quantity }
    });

    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return serverError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await authorizeCartWrite(request);
    if (user instanceof NextResponse) return user;

    const parsed = cartItemDeleteSchema.safeParse(await requestBody(request));
    if (!parsed.success) return jsonError("Invalid cart item.", 400);

    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      select: { id: true }
    });
    if (!cart) return jsonError("Cart item not found.", 404);

    const deleted = await prisma.cartItem.deleteMany({
      where: { id: parsed.data.cartItemId, cartId: cart.id }
    });
    if (deleted.count !== 1) return jsonError("Cart item not found.", 404);

    return NextResponse.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return serverError(error);
  }
}