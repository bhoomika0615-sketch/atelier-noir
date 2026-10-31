import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
export const dynamic="force-dynamic";
export default async function AdminPage(){
 try{await requireAdmin();}catch{redirect("/admin/login");}
 const [products,orders,users]=await Promise.all([prisma.product.count(),prisma.order.count(),prisma.user.count()]);
 return <main className="container section"><div className="eyebrow">ATELIER NOIR / CONTROL ROOM</div><h1 className="section-title">Administration</h1><div className="grid-products" style={{marginTop:40}}>{[["Products",products],["Orders",orders],["Customers",users]].map(([k,v])=><div key={k} style={{border:"1px solid var(--line)",padding:28}}><div className="eyebrow">{k}</div><div className="serif" style={{fontSize:52}}>{v}</div></div>)}</div><p style={{fontSize:12,color:"var(--muted)",marginTop:30}}>Product management API is available to authorized administrators. See README for API usage and deployment setup.</p></main>;
}