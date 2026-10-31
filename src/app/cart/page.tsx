import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { CheckoutForm } from "@/components/checkout-form";
export const dynamic="force-dynamic";
export default async function CartPage(){
 const user=await getCurrentUser();
 if(!user)return <main className="container section"><h1 className="section-title">Your bag</h1><p>Please sign in to view your bag.</p><Link className="button" href="/login">Sign in</Link></main>;
 const cart=await prisma.cart.findUnique({where:{userId:user.id},include:{items:{include:{variant:{include:{product:true}}}}}});
 const subtotal=cart?.items.reduce((sum,i)=>sum+i.variant.product.pricePaise*i.quantity,0)||0;
 return <main className="container section"><div className="eyebrow">Your selection</div><h1 className="section-title">Shopping bag</h1>{!cart?.items.length?<p>Your bag is currently empty. <Link href="/shop">Discover the collection.</Link></p>:<div style={{maxWidth:760}}>{cart.items.map(i=><div key={i.id} style={{padding:"20px 0",borderBottom:"1px solid var(--line)",display:"flex",justifyContent:"space-between"}}><div><b>{i.variant.product.name}</b><p className="product-meta">Size {i.variant.size} · Qty {i.quantity}</p></div><span>₹{(i.variant.product.pricePaise*i.quantity/100).toLocaleString("en-IN")}</span></div>)}<div style={{display:"flex",justifyContent:"space-between",marginTop:25,fontWeight:600}}><span>Subtotal</span><span>₹{(subtotal/100).toLocaleString("en-IN")}</span></div><p style={{fontSize:11,color:"var(--muted)"}}>Shipping and applicable taxes are calculated during order configuration.</p><CheckoutForm/></div>}</main>;
}