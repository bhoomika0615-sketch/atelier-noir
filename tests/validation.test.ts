import { describe,it,expect } from "vitest";
import { registerSchema, loginSchema, cartItemIdSchema, cartSchema } from "../src/lib/validation";
describe("request validation",()=>{
 it("normalizes registration email",()=>{expect(registerSchema.parse({name:"Alex Smith",email:"ALEX@EXAMPLE.COM",password:"a-very-long-password"}).email).toBe("alex@example.com");});
 it("rejects weak registration passwords",()=>{expect(registerSchema.safeParse({name:"Alex",email:"a@b.com",password:"short"}).success).toBe(false);});
 it("rejects cart quantities above five",()=>{expect(cartSchema.safeParse({variantId:"clxxxxxxxxxxxxxxxxxxxxxxxxx",quantity:99}).success).toBe(false);});
 it("validates cart item removal identifiers",()=>{expect(cartItemIdSchema.safeParse({variantId:"clxxxxxxxxxxxxxxxxxxxxxxxxx"}).success).toBe(true);});
 it("rejects malformed login email",()=>{expect(loginSchema.safeParse({email:"not-email",password:"password"}).success).toBe(false);});
});