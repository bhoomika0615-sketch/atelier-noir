"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type CartLine = {
  id: string;
  variantId: string;
  name: string;
  slug: string;
  size: string;
  quantity: number;
  unitPricePaise: number;
  availableQuantity: number;
  image: { url: string; alt: string } | null;
};

export function CartItems({ items }: { items: CartLine[] }) {
  const router = useRouter();
  const [busyItemId, setBusyItemId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  async function updateItem(item: CartLine, method: "PATCH" | "DELETE", quantity?: number) {
    if (busyItemId) return;

    setBusyItemId(item.id);
    setMessage("");
    try {
      const response = await fetch("/api/cart/items", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(method === "PATCH"
          ? { cartItemId: item.id, quantity }
          : { cartItemId: item.id })
      });
      const data: unknown = await response.json();

      if (!response.ok) {
        const errorMessage =
          typeof data === "object" && data !== null && "error" in data && typeof data.error === "string"
            ? data.error
            : "Your bag could not be updated. Please try again.";
        setMessage(errorMessage);
        return;
      }

      router.refresh();
    } catch (error) {
      console.error("[cart-update]", error);
      setMessage("Unable to reach the store. Check your connection and try again.");
    } finally {
      setBusyItemId(null);
    }
  }

  return (
    <>
      {items.map((item) => {
        const isBusy = busyItemId === item.id;
        return (
          <article className="cart-item" key={item.id} aria-busy={isBusy}>
            <div className="cart-item-main">
              <Link className="cart-item-image" href={`/product/${item.slug}`}>
                {item.image
                  ? <img src={item.image.url} alt={item.image.alt} loading="lazy" />
                  : <span>{item.name}</span>}
              </Link>
              <div className="cart-item-details">
                <h2><Link href={`/product/${item.slug}`}>{item.name}</Link></h2>
                <p className="product-meta">Size {item.size}</p>
                <div className="cart-item-controls" role="group" aria-label={`Quantity for ${item.name}, size ${item.size}`}>
                  <button
                    type="button"
                    aria-label={`Decrease ${item.name} quantity`}
                    onClick={() => updateItem(item, "PATCH", item.quantity - 1)}
                    disabled={isBusy || item.quantity <= 1}
                  >−</button>
                  <span aria-live="polite">{item.quantity}</span>
                  <button
                    type="button"
                    aria-label={`Increase ${item.name} quantity`}
                    onClick={() => updateItem(item, "PATCH", item.quantity + 1)}
                    disabled={isBusy || item.quantity >= Math.min(item.availableQuantity, 5)}
                  >+</button>
                </div>
                <button
                  type="button"
                  className="cart-item-remove"
                  onClick={() => updateItem(item, "DELETE")}
                  disabled={isBusy}
                >Remove</button>
              </div>
            </div>
            <span className="cart-item-price">₹{(item.unitPricePaise * item.quantity / 100).toLocaleString("en-IN")}</span>
          </article>
        );
      })}
      {message && <p className="cart-feedback" role="status" aria-live="polite">{message}</p>}
    </>
  );
}
