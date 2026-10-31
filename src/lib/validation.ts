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
export const productSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().min(2).max(140).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().trim().min(10).max(5000),
  category: z.string().trim().min(2).max(60),
  pricePaise: z.number().int().min(100).max(50000000),
  published: z.boolean().default(false),
  featured: z.boolean().default(false),
  images: z.array(z.object({ url: z.string().url().max(2000), alt: z.string().trim().max(160) }).strict()).max(8)
}).strict();

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
