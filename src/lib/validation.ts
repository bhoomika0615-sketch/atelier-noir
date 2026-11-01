import { z } from "zod";

export const emailSchema = z.string().trim().email().max(254).transform(v => v.toLowerCase());
export const passwordSchema = z.string().min(12).max(128);
export const registerSchema = z.object({
  name: z.string().trim().min(2).max(80).regex(/^[\p{L}\p{M} .'-]+$/u),
  email: emailSchema,
  password: passwordSchema
}).strict();
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(128)
}).strict();
export const cartSchema = z.object({
  variantId: z.string().cuid(),
  quantity: z.number().int().min(1).max(5)
}).strict();
export const cartItemUpdateSchema = z.object({
  cartItemId: z.string().cuid(),
  quantity: z.number().int().min(1).max(5)
}).strict();
export const cartItemDeleteSchema = z.object({
  cartItemId: z.string().cuid()
}).strict();
const productVariantSchema = z.object({
  id: z.string().cuid().optional(),
  sku: z.string().trim().min(2).max(64).regex(/^[A-Za-z0-9_-]+$/),
  size: z.string().trim().min(1).max(32),
  color: z.string().trim().min(1).max(40),
  stock: z.number().int().min(0).max(100000)
}).strict();

export const productSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().min(2).max(140).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().trim().min(10).max(5000),
  category: z.string().trim().min(2).max(60),
  pricePaise: z.number().int().min(100).max(50000000),
  compareAtPaise: z.number().int().min(100).max(50000000).nullable().optional(),
  published: z.boolean().default(false),
  featured: z.boolean().default(false),
  images: z.array(z.object({
    url: z.string().url().max(2000),
    alt: z.string().trim().min(1).max(160)
  }).strict()).max(8),
  variants: z.array(productVariantSchema).min(1).max(40)
}).strict().superRefine((product, context) => {
  if (product.compareAtPaise !== undefined && product.compareAtPaise !== null && product.compareAtPaise < product.pricePaise) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["compareAtPaise"],
      message: "Original price must be greater than or equal to the current price."
    });
  }

  const skus = new Set<string>();
  const variantIds = new Set<string>();
  for (const [index, variant] of product.variants.entries()) {
    const sku = variant.sku.toUpperCase();
    if (skus.has(sku)) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ["variants", index, "sku"], message: "SKUs must be unique." });
    }
    skus.add(sku);

    if (variant.id && variantIds.has(variant.id)) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ["variants", index, "id"], message: "A variant can only appear once." });
    }
    if (variant.id) variantIds.add(variant.id);
  }
});

export const shippingAddressSchema = z.object({
  fullName: z.string().trim().min(2).max(100),
  line1: z.string().trim().min(3).max(180),
  line2: z.string().trim().max(180).optional().nullable(),
  city: z.string().trim().min(2).max(80),
  state: z.string().trim().min(2).max(80),
  postalCode: z.string().trim().min(4).max(12).regex(/^[A-Za-z0-9 -]+$/),
  country: z.string().trim().min(2).max(56).default("India"),
  phone: z.string().trim().regex(/^[+0-9 ()-]{8,20}$/)
}).strict();
