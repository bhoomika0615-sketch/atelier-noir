import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
export const dynamic="force-dynamic";
export default async function AccountPage(){
 const user=await getCurrentUser();if(!user)redirect("/login");
 const orders=await prisma.order.findMany({where:{userId:user.id},orderBy:{createdAt:"desc"},take:20,select:{id:true,orderNumber:true,status:true,totalPaise:true,createdAt:true}});
 return <main className="container section"><div className="eyebrow">Your account</div><h1 className="section-title">Hello, {user.name}</h1><p style={{fontSize:12,color:"var(--muted)"}}>{user.email}</p><h2 style={{marginTop:50,fontFamily:"'Playfair Display',serif",fontSize:30}}>Order history</h2>{orders.length?orders.map(o=><div key={o.id} style={{padding:"18px 0",borderBottom:"1px solid var(--line)",display:"flex",justifyContent:"space-between"}}><span>{o.orderNumber} · {o.status}</span><span>₹{(o.totalPaise/100).toLocaleString("en-IN")}</span></div>):<p>No orders yet.</p>}</main>;
}