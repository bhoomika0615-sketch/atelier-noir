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
  return <div><div className="eyebrow" style={{marginBottom:12}}>Select size</div><div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:26}}>{variants.map(v=><button key={v.id} className={`button ${variantId===v.id?"":"button-outline"}`} onClick={()=>setVariantId(v.id)} disabled={v.stock<1}>{v.size}</button>)}</div><button className="button" style={{width:"100%"}} onClick={add} disabled={!variantId}>Add to bag</button>{message&&<p role="status" style={{fontSize:12,marginTop:12}}>{message}</p>}</div>;
}