import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { adminOrResponse } from "@/lib/guards";
import { productSchema } from "@/lib/validation";
import { assertSameOrigin, jsonError, serverError } from "@/lib/http";
import { enforceRateLimit } from "@/lib/rate-limit";

type RouteContext = { params: Promise<{ id: string }> };

function isUniqueConstraintError(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2002";
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const admin = await adminOrResponse();
    if (admin instanceof NextResponse) return admin;
    if (!assertSameOrigin(request)) return jsonError("Invalid request origin.", 403);
    if (!await enforceRateLimit(`admin-products:${admin.id}`, 30, 60)) {
      return jsonError("Too many product changes. Please wait and try again.", 429);
    }

    const { id } = await params;
    const parsed = productSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return jsonError("Invalid product details.", 400);
    const { images, variants, ...data } = parsed.data;

    const product = await prisma.$transaction(async (tx) => {
      const current = await tx.product.findUnique({
        where: { id },
        include: { variants: true }
      });
      if (!current) return null;

      const currentVariants = new Map(current.variants.map((variant) => [variant.id, variant]));
      const submittedIds = new Set(variants.flatMap((variant) => variant.id ? [variant.id] : []));
      if ([...submittedIds].some((variantId) => !currentVariants.has(variantId))) {
        throw new Error("INVALID_PRODUCT_VARIANT");
      }

      await tx.product.update({
        where: { id },
        data: {
          ...data,
          compareAtPaise: data.compareAtPaise ?? null,
          images: {
            deleteMany: {},
            create: images.map((image, position) => ({ ...image, position }))
          }
        }
      });

      for (const variant of variants) {
        if (variant.id) {
          const currentVariant = currentVariants.get(variant.id);
          if (!currentVariant || variant.stock < currentVariant.reserved) {
            throw new Error("STOCK_BELOW_RESERVED");
          }
          await tx.productVariant.update({
            where: { id: variant.id },
            data: { sku: variant.sku, size: variant.size, color: variant.color, stock: variant.stock }
          });
        } else {
          await tx.productVariant.create({
            data: { productId: id, sku: variant.sku, size: variant.size, color: variant.color, stock: variant.stock }
          });
        }
      }

      for (const currentVariant of current.variants) {
        if (!submittedIds.has(currentVariant.id)) {
          await tx.productVariant.update({
            where: { id: currentVariant.id },
            data: { stock: currentVariant.reserved }
          });
        }
      }

      return tx.product.findUnique({
        where: { id },
        include: { images: { orderBy: { position: "asc" } }, variants: { orderBy: { size: "asc" } } }
      });
    });

    if (!product) return jsonError("Product not found.", 404);
    return NextResponse.json({ product }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof Error && error.message === "INVALID_PRODUCT_VARIANT") {
      return jsonError("A submitted size variant does not belong to this product.", 400);
    }
    if (error instanceof Error && error.message === "STOCK_BELOW_RESERVED") {
      return jsonError("Stock cannot be reduced below the quantity already reserved for payment.", 409);
    }
    if (isUniqueConstraintError(error)) return jsonError("A product slug or SKU is already in use.", 409);
    return serverError(error);
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  try {
    const admin = await adminOrResponse();
    if (admin instanceof NextResponse) return admin;
    if (!assertSameOrigin(request)) return jsonError("Invalid request origin.", 403);
    if (!await enforceRateLimit(`admin-products:${admin.id}`, 30, 60)) {
      return jsonError("Too many product changes. Please wait and try again.", 429);
    }

    const { id } = await params;
    const result = await prisma.product.updateMany({ where: { id }, data: { published: false } });
    if (result.count !== 1) return jsonError("Product not found.", 404);
    return NextResponse.json({ archived: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return serverError(error);
  }
}
