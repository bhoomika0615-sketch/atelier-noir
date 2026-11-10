"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type CartItem = {
  id: string;
  variantId: string;
  name: string;
  slug: string;
  size: string;
  quantity: number;
  availableQuantity: number;
  pricePaise: number;
  image: { url: string; alt: string } | null;
};

function formatPrice(pricePaise: number) {
  return `₹${(pricePaise / 100).toLocaleString("en-IN")}`;
}

export function CartItems({ items }: { items: CartItem[] }) {
  const router = useRouter();
  const [busyVariant, setBusyVariant] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function changeItem(variantId: string, method: "PATCH" | "DELETE", quantity?: number) {
    if (busyVariant) return;
    setBusyVariant(variantId);
    setError("");

    try {
      const response = await fetch("/api/cart/items", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(method === "DELETE" ? { variantId } : { variantId, quantity })
      });
      const data: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        const message = typeof data === "object" && data !== null && "error" in data && typeof data.error === "string"
          ? data.error
          : "Unable to update your bag. Please try again.";
        throw new Error(message);
      }
      router.refresh();
    } catch (requestError) {
      console.error("[cart-items]", requestError);
      setError(requestError instanceof Error ? requestError.message : "Unable to update your bag. Please try again.");
    } finally {
      setBusyVariant(null);
    }
  }

  return (
    <>
      {items.map((item) => {
        const isBusy = busyVariant === item.variantId;
        const maxQuantity = Math.min(item.availableQuantity, 5);
        return (
          <article className="cart-item" key={item.id}>
            <div className="cart-item-content">
              <div className="cart-item-product">
                {item.image && <img className="cart-item-image" src={item.image.url} alt={item.image.alt} />}
                <div>
                  <h2><Link href={`/product/${item.slug}`}>{item.name}</Link></h2>
                  <p className="product-meta">Size {item.size}</p>
                  <div className="cart-item-controls">
                    <div className="cart-quantity-control" aria-label={`Quantity for ${item.name}`}>
                      <button
                        type="button"
                        aria-label={`Decrease ${item.name} quantity`}
                        disabled={isBusy || item.quantity <= 1}
                        onClick={() => changeItem(item.variantId, "PATCH", item.quantity - 1)}
                      >−</button>
                      <span aria-live="polite">{item.quantity}</span>
                      <button
                        type="button"
                        aria-label={`Increase ${item.name} quantity`}
                        disabled={isBusy || item.quantity >= maxQuantity}
                        onClick={() => changeItem(item.variantId, "PATCH", item.quantity + 1)}
                      >+</button>
                    </div>
                    <button
                      type="button"
                      className="cart-remove"
                      disabled={isBusy}
                      onClick={() => changeItem(item.variantId, "DELETE")}
                    >{isBusy ? "Updating…" : "Remove"}</button>
                  </div>
                </div>
              </div>
            </div>
            <span>{formatPrice(item.pricePaise * item.quantity)}</span>
          </article>
        );
      })}
      {error && <p className="cart-editor-feedback" role="alert">{error}</p>}
    </>
  );
}
