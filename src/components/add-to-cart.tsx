"use client";

import { useState } from "react";

export function AddToCart({ variants }: { variants: { id: string; size: string; stock: number }[] }) {
  const [variantId, setVariantId] = useState(variants[0]?.id || "");
  const [message, setMessage] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  async function add() {
    if (!variantId || isAdding) return;

    setIsAdding(true);
    setMessage("");
    try {
      const response = await fetch("/api/cart/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId, quantity: 1 }),
      });

      if (response.ok) {
        setMessage("Added to your bag.");
        return;
      }

      const data: unknown = await response.json();
      const errorMessage =
        typeof data === "object" && data !== null && "error" in data && typeof data.error === "string"
          ? data.error
          : "Unable to add this item right now. Please try again.";
      setMessage(errorMessage);
    } catch (error) {
      console.error("[add-to-cart]", error);
      setMessage("Unable to reach the store. Check your connection and try again.");
    } finally {
      setIsAdding(false);
    }
  }

  return (
    <div className="add-to-cart" aria-busy={isAdding}>
      <div className="eyebrow size-label">Select size</div>
      {variants.length ? (
        <div className="size-options" role="group" aria-label="Available sizes">
          {variants.map((variant) => (
            <button
              type="button"
              key={variant.id}
              className={`size-option${variantId === variant.id ? " is-selected" : ""}`}
              onClick={() => {
                setVariantId(variant.id);
                setMessage("");
              }}
              disabled={isAdding || variant.stock < 1}
              aria-pressed={variantId === variant.id}
            >
              {variant.size}
            </button>
          ))}
        </div>
      ) : (
        <p className="product-unavailable" role="status">Currently unavailable</p>
      )}
      <button type="button" className="button add-to-bag" onClick={add} disabled={!variantId || isAdding}>
        {isAdding ? "Adding…" : "Add to bag"} <span aria-hidden="true">↗</span>
      </button>
      {message && <p className="cart-feedback" role="status" aria-live="polite">{message}</p>}
    </div>
  );
}
