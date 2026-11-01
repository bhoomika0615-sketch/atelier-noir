import { describe,it,expect } from "vitest";
import {
  registerSchema,
  loginSchema,
  cartSchema,
  cartItemDeleteSchema,
  cartItemUpdateSchema
} from "../src/lib/validation";
describe("request validation",()=>{
 it("normalizes registration email",()=>{expect(registerSchema.parse({name:"Alex Smith",email:"ALEX@EXAMPLE.COM",password:"a-very-long-password"}).email).toBe("alex@example.com");});
 it("rejects weak registration passwords",()=>{expect(registerSchema.safeParse({name:"Alex",email:"a@b.com",password:"short"}).success).toBe(false);});
 it("rejects cart quantities above five",()=>{expect(cartSchema.safeParse({variantId:"clxxxxxxxxxxxxxxxxxxxxxxxxx",quantity:99}).success).toBe(false);});
 it("validates cart item quantity updates",()=>{expect(cartItemUpdateSchema.safeParse({cartItemId:"clxxxxxxxxxxxxxxxxxxxxxxxxx",quantity:3}).success).toBe(true);expect(cartItemUpdateSchema.safeParse({cartItemId:"clxxxxxxxxxxxxxxxxxxxxxxxxx",quantity:6}).success).toBe(false);});
 it("validates cart item removal identifiers",()=>{expect(cartItemDeleteSchema.safeParse({cartItemId:"clxxxxxxxxxxxxxxxxxxxxxxxxx"}).success).toBe(true);expect(cartItemDeleteSchema.safeParse({cartItemId:"not-a-cuid"}).success).toBe(false);});
 it("rejects malformed login email",()=>{expect(loginSchema.safeParse({email:"not-email",password:"password"}).success).toBe(false);});
});