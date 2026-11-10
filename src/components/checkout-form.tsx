"use client";

import Script from "next/script";
import { useState, type FormEvent } from "react";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export function CheckoutForm() {
  const [form, setForm] = useState({
    fullName: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    phone: ""
  });
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  function update(key: keyof typeof form, value: string) {
    setForm((old) => ({ ...old, [key]: value }));
  }

  async function checkout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setMessage("");

    try {
      if (!window.Razorpay) throw new Error("Payment service is still loading. Please try again.");
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: form })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to start checkout.");

      const razorpay = new window.Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "ATELIER NOIR",
        description: `Order ${data.orderNumber}`,
        order_id: data.razorpayOrderId,
        handler: () => {
          setMessage("Payment submitted. Your order status will update after secure payment confirmation.");
          window.location.href = "/account";
        },
        modal: {
          ondismiss: () => setMessage("Payment was not completed. Your reserved items may remain held until payment status is confirmed.")
        },
        theme: { color: "#171715" }
      });
      razorpay.open();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Checkout could not be started.");
    } finally {
      setBusy(false);
    }
  }

  const fields: {
    key: keyof typeof form;
    label: string;
    required: boolean;
    autoComplete: string;
    type?: string;
  }[] = [
    { key: "fullName", label: "Full name", required: true, autoComplete: "name" },
    { key: "line1", label: "Address line 1", required: true, autoComplete: "address-line1" },
    { key: "line2", label: "Address line 2", required: false, autoComplete: "address-line2" },
    { key: "city", label: "City", required: true, autoComplete: "address-level2" },
    { key: "state", label: "State", required: true, autoComplete: "address-level1" },
    { key: "postalCode", label: "PIN / postal code", required: true, autoComplete: "postal-code" },
    { key: "country", label: "Country", required: true, autoComplete: "country-name" },
    { key: "phone", label: "Phone number", required: true, autoComplete: "tel", type: "tel" }
  ];

  return (
    <section className="checkout-form" aria-busy={busy}>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      <div className="eyebrow">Secure checkout</div>
      <h2 className="serif checkout-title">Delivery details</h2>
      <form onSubmit={checkout}>
        <div className="checkout-fields">
          {fields.map((field) => (
            <label key={field.key} className="form-label">
              {field.label}
              <input
                className="field"
                name={field.key}
                type={field.type ?? "text"}
                autoComplete={field.autoComplete}
                value={form[field.key]}
                required={field.required}
                maxLength={180}
                onChange={(event) => update(field.key, event.target.value)}
              />
            </label>
          ))}
        </div>
        <button className="button checkout-submit" type="submit" disabled={busy}>
          {busy ? "Preparing secure checkout…" : "Continue to payment"} <span aria-hidden="true">↗</span>
        </button>
      </form>
      {message && <p className="checkout-feedback" role="status" aria-live="polite">{message}</p>}
    </section>
  );
}
