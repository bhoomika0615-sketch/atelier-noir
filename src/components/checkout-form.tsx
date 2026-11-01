 "use client";

 import Script from "next/script";
 import Link from "next/link";
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
  const [paymentAttempted, setPaymentAttempted] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  type AddressField = keyof typeof form;
  function update(key: AddressField, value: string) {
    setForm((old) => ({ ...old, [key]: value }));
  }
  async function checkout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;

    setBusy(true);
    setMessage("");
    let paymentOpened = false;
    let paymentCompleted = false;
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
        description: "Order " + data.orderNumber,
        order_id: data.razorpayOrderId,
        handler: async (result: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          paymentCompleted = true;
          setPaymentAttempted(true);
          setMessage("Verifying payment with the gateway…");
          try {
            const verificationResponse = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId: data.orderId,
                razorpay_order_id: result.razorpay_order_id,
                razorpay_payment_id: result.razorpay_payment_id,
                razorpay_signature: result.razorpay_signature
              })
            });
            const verificationData: unknown = await verificationResponse.json();
            if (!verificationResponse.ok) {
              const errorMessage =
                typeof verificationData === "object" && verificationData !== null
                  && "error" in verificationData && typeof verificationData.error === "string"
                  ? verificationData.error
                  : "Payment could not be verified.";
              throw new Error(errorMessage);
            }
            if (typeof verificationData !== "object" || verificationData === null
              || !("orderNumber" in verificationData) || typeof verificationData.orderNumber !== "string") {
              throw new Error("Payment verification returned an invalid response.");
            }
            setOrderNumber(verificationData.orderNumber);
            setMessage("Payment details verified. Final order status will update after gateway capture confirmation.");
          } catch (error) {
            console.error("[checkout-payment-verification]", error);
            setMessage("The gateway reported payment success, but we could not confirm it yet. Check your order history before attempting payment again.");
          } finally {
            setBusy(false);
          }
        },
        modal: {
          ondismiss: () => {
            setBusy(false);
            if (!paymentCompleted) {
              setMessage("Payment was not completed. Your reserved items may remain held until the gateway reports its final status.");
            }
          }
        },
        theme: { color: "#171715" }
      });
      razorpay.open();
      paymentOpened = true;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Checkout could not be started.");
    } finally {
      if (!paymentOpened) setBusy(false);
    }
  }
  const fields: { key: AddressField; label: string; required: boolean; autoComplete: string }[] = [
    { key: "fullName", label: "Full name", required: true, autoComplete: "name" },
    { key: "line1", label: "Address line 1", required: true, autoComplete: "address-line1" },
    { key: "line2", label: "Address line 2", required: false, autoComplete: "address-line2" },
    { key: "city", label: "City", required: true, autoComplete: "address-level2" },
    { key: "state", label: "State", required: true, autoComplete: "address-level1" },
    { key: "postalCode", label: "PIN / postal code", required: true, autoComplete: "postal-code" },
    { key: "country", label: "Country", required: true, autoComplete: "country-name" },
    { key: "phone", label: "Phone number", required: true, autoComplete: "tel" }
  ];
  return <section className="checkout-form" aria-busy={busy}>
    <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive"/>
    <div className="eyebrow">Secure checkout</div>
    <h2 className="serif checkout-title">Delivery details</h2>
    <form onSubmit={checkout}>
      <div className="checkout-fields">
        {fields.map(({ key, label, required, autoComplete }) => (
          <label key={key} className="form-label">
            {label}
            <input
              className="field"
              name={key}
              autoComplete={autoComplete}
              value={form[key]}
              required={required}
              maxLength={180}
              onChange={(event) => update(key, event.target.value)}
            />
          </label>
        ))}
      </div>
      <button className="button checkout-submit" type="submit" disabled={busy || paymentAttempted}>
        {busy ? "Preparing secure checkout…" : "Continue to payment"} <span aria-hidden="true">↗</span>
      </button>
      {message && <p className="checkout-feedback" role="status" aria-live="polite">{message}</p>}
      {paymentAttempted && <Link className="text-link checkout-order-link" href="/account">View order history{orderNumber ? ` · ${orderNumber}` : ""} <span aria-hidden="true">↗</span></Link>}
    </form>
  </section>;
}
