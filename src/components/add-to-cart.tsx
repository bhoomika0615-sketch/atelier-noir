 "use client";
import { useState } from "react";
export function AddToCart({variants}:{variants:{id:string;size:string;stock:number}[]}) {
  const [variantId,setVariantId]=useState(variants[0]?.id||"");
  const [message,setMessage]=useState("");
  async function add(){
    setMessage("");
    const res=await fetch("/api/cart/items",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({variantId,quantity:1})});
    const data=await res.json();
    setMessage(res.ok?"Added to your bag.":data.error||"Please sign in to add items.");
  }
  return (
    <div className="add-to-cart">
      <div className="eyebrow size-label">Select size</div>
      {variants.length ? (
        <div className="size-options" role="group" aria-label="Available sizes">
          {variants.map((variant) => (
            <button
              type="button"
              key={variant.id}
              className={`size-option${variantId === variant.id ? " is-selected" : ""}`}
              onClick={() => setVariantId(variant.id)}
              disabled={variant.stock < 1}
              aria-pressed={variantId === variant.id}
            >
              {variant.size}
            </button>
          ))}
        </div>
      ) : (
        <p className="product-unavailable" role="status">Currently unavailable</p>
      )}
      <button type="button" className="button add-to-bag" onClick={add} disabled={!variantId}>Add to bag <span aria-hidden="true">↗</span></button>
      {message && <p className="cart-feedback" role="status">{message}</p>}
    </div>
  );
}