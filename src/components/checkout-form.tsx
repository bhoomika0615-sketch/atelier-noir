 "use client";
import Script from "next/script";
import { useState } from "react";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export function CheckoutForm() {
  const [form,setForm]=useState({fullName:"",line1:"",line2:"",city:"",state:"",postalCode:"",country:"India",phone:""});
  const [message,setMessage]=useState("");
  const [busy,setBusy]=useState(false);
  function update(key:string,value:string){setForm(old=>({...old,[key]:value}));}
  async function checkout(){
    setBusy(true);setMessage("");
    try {
      if(!window.Razorpay)throw new Error("Payment service is still loading. Please try again.");
      const response=await fetch("/api/checkout",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({address:form})});
      const data=await response.json();
      if(!response.ok)throw new Error(data.error||"Unable to start checkout.");
      const razorpay=new window.Razorpay({
        key:data.keyId,amount:data.amount,currency:data.currency,name:"ATELIER NOIR",
        description:"Order "+data.orderNumber,order_id:data.razorpayOrderId,
        handler:()=>{setMessage("Payment submitted. Your order status will update after secure payment confirmation.");window.location.href="/account";},
        modal:{ondismiss:()=>setMessage("Payment was not completed. Your reserved items may remain held until payment status is confirmed.")},
        theme:{color:"#171715"}
      });
      razorpay.open();
    } catch(error){setMessage(error instanceof Error?error.message:"Checkout could not be started.");}
    finally{setBusy(false);}
  }
  const fields:[string,string,boolean][]=[["fullName","Full name",true],["line1","Address line 1",true],["line2","Address line 2",false],["city","City",true],["state","State",true],["postalCode","PIN / postal code",true],["country","Country",true],["phone","Phone number",true]];
  return <section style={{maxWidth:600,marginTop:40}}>
    <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive"/>
    <h2 className="serif" style={{fontSize:34}}>Delivery details</h2>
    {fields.map(([key,label,required])=><label key={key} className="eyebrow" style={{display:"block",marginTop:12}}>{label}<input className="field" value={form[key as keyof typeof form]} required={required} maxLength={180} onChange={e=>update(key,e.target.value)}/></label>)}
    <button className="button" style={{width:"100%"}} disabled={busy} onClick={checkout}>{busy?"Preparing secure checkout…":"Continue to payment"}</button>
    {message&&<p role="status" style={{fontSize:12,lineHeight:1.7,marginTop:14}}>{message}</p>}
  </section>;
}
