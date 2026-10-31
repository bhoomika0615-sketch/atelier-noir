import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AddToCart } from "@/components/add-to-cart";
export const dynamic = "force-dynamic";
export default async function ProductPage({params}:{params:Promise<{slug:string}>}) {
  const {slug}=await params;
  const product=await prisma.product.findFirst({where:{slug,published:true},include:{images:{orderBy:{position:"asc"}},variants:{where:{stock:{gt:0}},orderBy:{size:"asc"}}}});
  if(!product) notFound();
  return (
    <main className="container section product-detail">
      <div className="product-gallery grid-products">
        {product.images.map(img=><div className="product-image" key={img.id}><img src={img.url} alt={img.alt}/></div>)}
      </div>
      <div className="product-details">
        <div className="eyebrow">{product.category}</div>
        <h1 className="serif product-title">{product.name}</h1>
        <p className="product-price">₹{(product.pricePaise/100).toLocaleString("en-IN")}</p>
        <p className="product-description">{product.description}</p>
        <AddToCart variants={product.variants.map(v=>({id:v.id,size:v.size,stock:v.stock}))}/>
      </div>
    </main>
  );
}
