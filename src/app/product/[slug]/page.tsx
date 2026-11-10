import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AddToCart } from "@/components/add-to-cart";
export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await prisma.product.findFirst({
    where: { slug, published: true },
    include: {
      images: { orderBy: { position: "asc" } },
      variants: { where: { stock: { gt: 0 } }, orderBy: { size: "asc" } }
    }
  });

  if (!product) notFound();

  const availableVariants = product.variants
    .filter((variant) => variant.stock - variant.reserved > 0)
    .map((variant) => ({
      id: variant.id,
      size: variant.size,
      stock: variant.stock - variant.reserved,
    }));

  return (
    <main className="container section product-page">
      <nav className="product-breadcrumb eyebrow" aria-label="Breadcrumb">
        <Link href="/shop">The collection</Link>
        <span aria-hidden="true">/</span>
        <span>{product.category}</span>
      </nav>
      <div className="product-detail">
        <div className="product-gallery">
          {product.images.map((image) => (
            <div className="product-image" key={image.id}>
              <img src={image.url} alt={image.alt} />
            </div>
          ))}
        </div>
        <div className="product-details">
          <div className="eyebrow">{product.category} / ATELIER NOIR</div>
          <h1 className="serif product-title">{product.name}</h1>
          <p className="product-price">
            ₹{(product.pricePaise / 100).toLocaleString("en-IN")}
            {product.compareAtPaise !== null && product.compareAtPaise > product.pricePaise && (
              <>
                <del>₹{(product.compareAtPaise / 100).toLocaleString("en-IN")}</del>
                <span className="product-sale-label">Sale</span>
              </>
            )}
          </p>
          <p className="product-description">{product.description}</p>
          <AddToCart variants={availableVariants} />
          <p className="product-assurance">Considered materials. Made to be worn on repeat.</p>
        </div>
      </div>
    </main>
  );
}
