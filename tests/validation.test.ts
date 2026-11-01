import { describe,it,expect } from "vitest";
import {
  registerSchema,
  loginSchema,
  cartSchema,
  cartItemDeleteSchema,
  cartItemUpdateSchema,
  productSchema
} from "../src/lib/validation";
import { createHmac } from "node:crypto";
import { verifyRazorpayCheckoutSignature } from "../src/lib/payments";

const validProduct = {
  name: "Structured Overshirt",
  slug: "structured-overshirt",
  description: "A considered layer for everyday wear.",
  category: "Outerwear",
  pricePaise: 129900,
  published: true,
  featured: false,
  images: [{ url: "https://images.example.com/overshirt.jpg", alt: "Front view of the overshirt" }],
  variants: [{ sku: "OVERSHIRT-M-BLK", size: "M", color: "Black", stock: 8 }]
};

describe("request validation",()=>{
 it("normalizes registration email",()=>{expect(registerSchema.parse({name:"Alex Smith",email:"ALEX@EXAMPLE.COM",password:"a-very-long-password"}).email).toBe("alex@example.com");});
 it("rejects weak registration passwords",()=>{expect(registerSchema.safeParse({name:"Alex",email:"a@b.com",password:"short"}).success).toBe(false);});
 it("rejects cart quantities above five",()=>{expect(cartSchema.safeParse({variantId:"clxxxxxxxxxxxxxxxxxxxxxxxxx",quantity:99}).success).toBe(false);});
 it("validates cart item quantity updates",()=>{expect(cartItemUpdateSchema.safeParse({cartItemId:"clxxxxxxxxxxxxxxxxxxxxxxxxx",quantity:3}).success).toBe(true);expect(cartItemUpdateSchema.safeParse({cartItemId:"clxxxxxxxxxxxxxxxxxxxxxxxxx",quantity:6}).success).toBe(false);});
 it("validates cart item removal identifiers",()=>{expect(cartItemDeleteSchema.safeParse({cartItemId:"clxxxxxxxxxxxxxxxxxxxxxxxxx"}).success).toBe(true);expect(cartItemDeleteSchema.safeParse({cartItemId:"not-a-cuid"}).success).toBe(false);});
 it("rejects malformed login email",()=>{expect(loginSchema.safeParse({email:"not-email",password:"password"}).success).toBe(false);});
 it("accepts purchasable catalog products with a unique variant SKU",()=>{expect(productSchema.safeParse(validProduct).success).toBe(true);});
 it("rejects duplicate variant SKUs and invalid sale prices",()=>{
  expect(productSchema.safeParse({...validProduct,variants:[...validProduct.variants,{sku:"overshirt-m-blk",size:"L",color:"Black",stock:3}]}).success).toBe(false);
  expect(productSchema.safeParse({...validProduct,compareAtPaise:1000}).success).toBe(false);
 });
});

describe("Razorpay checkout signature verification",()=>{
 it("verifies the provider HMAC over the order and payment identifiers",()=>{
  const secret="test-secret";
  const signature=createHmac("sha256",secret).update("order_123|pay_456").digest("hex");
  expect(verifyRazorpayCheckoutSignature("order_123","pay_456",signature,secret)).toBe(true);
  expect(verifyRazorpayCheckoutSignature("order_123","pay_other",signature,secret)).toBe(false);
  expect(verifyRazorpayCheckoutSignature("order_123","pay_456","not-a-signature",secret)).toBe(false);
 });
});