import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { CheckoutForm } from "@/components/checkout-form";
import { CartItems } from "@/components/cart-items";
export const dynamic = "force-dynamic";

export default async function CartPage() {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <main className="container section cart-page">
        <div className="eyebrow">Your selection</div>
        <h1 className="section-title">Your bag</h1>
        <div className="cart-empty">
          <p>Please sign in to view your bag.</p>
          <Link className="button" href="/login">Sign in <span aria-hidden="true">↗</span></Link>
        </div>
      </main>
    );
  }

  const cart = await prisma.cart.findUnique({
    where: { userId: user.id },
    include: {
      items: {
        include: {
          variant: {
            include: {
              product: {
                include: { images: { orderBy: { position: "asc" }, take: 1 } }
              }
            }
          }
        }
      }
    }
  });
  const subtotal = cart?.items.reduce((sum, item) => sum + item.variant.product.pricePaise * item.quantity, 0) || 0;
  const cartItems = cart?.items.map((item) => ({
    id: item.id,
    variantId: item.variant.id,
    name: item.variant.product.name,
    slug: item.variant.product.slug,
    size: item.variant.size,
    quantity: item.quantity,
    unitPricePaise: item.variant.product.pricePaise,
    availableQuantity: Math.max(item.variant.stock - item.variant.reserved, 0),
    image: item.variant.product.images[0] ?? null
  })) ?? [];

  return (
    <main className="container section cart-page">
      <div className="eyebrow">Your selection</div>
      <h1 className="section-title">Shopping bag</h1>
      {!cart?.items.length ? (
        <div className="cart-empty">
          <p>Your bag is currently empty.</p>
          <Link className="text-link" href="/shop">Discover the collection <span aria-hidden="true">↗</span></Link>
        </div>
      ) : (
        <div className="cart-layout">
          <section className="cart-items" aria-label="Items in your bag">
            <CartItems items={cartItems} />
            <div className="cart-subtotal">
              <span>Subtotal</span>
              <span>₹{(subtotal / 100).toLocaleString("en-IN")}</span>
            </div>
            <p className="cart-shipping-note">Shipping and applicable taxes are calculated during order configuration.</p>
          </section>
          <CheckoutForm />
        </div>
      )}
    </main>
  );
}