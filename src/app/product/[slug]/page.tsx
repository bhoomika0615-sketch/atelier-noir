import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AddToCart } from "@/components/add-to-cart";
export const dynamic = "force-dynamic";
export default async function ProductPage({params}:{params:Promise<{slug:string}>}) {
  const {slug}=await params;
  const product=await prisma.product.findFirst({where:{slug,published:true},include:{images:{orderBy:{position:"asc"}},variants:{where:{stock:{gt:0}},orderBy:{size:"asc"}}}});
  if(!product) notFound();
  return <main className="container section" style={{display:"grid",gridTemplateColumns:"1.1fr .9fr",gap:50}}>
    <div className="grid-products" style={{gridTemplateColumns:"repeat(2,minmax(0,1fr))"}}>{product.images.map(img=><div className="product-image" key={img.id}><img src={img.url} alt={img.alt}/></div>)}</div>
    <div style={{paddingTop:25}}><div className="eyebrow">{product.category}</div><h1 className="serif" style={{fontSize:54,lineHeight:1.05}}>{product.name}</h1><p style={{fontSize:15}}>₹{(product.pricePaise/100).toLocaleString("en-IN")}</p><p style={{fontSize:13,lineHeight:1.9,color:"var(--muted)",margin:"28px 0"}}>{product.description}</p><AddToCart variants={product.variants.map(v=>({id:v.id,size:v.size,stock:v.stock}))}/></div>
  </main>;
}