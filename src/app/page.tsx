import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Reveal } from "@/components/reveal";
import { MotionLink } from "@/components/motion-link";
import { ProductRail } from "@/components/product-rail";
import { SartorialStage } from "@/components/sartorial-stage";

export const dynamic = "force-dynamic";
export default async function HomePage() {
  const records = await prisma.product.findMany({
    where: { published: true },
    include: {
      images: { orderBy: { position: "asc" }, take: 1 },
      variants: { select: { stock: true, reserved: true } }
    },
    orderBy: { createdAt: "desc" }
  });
  const products = records.map((product) => ({
    id: product.id,
    slug: product.slug,
    name: product.name,
    category: product.category,
    pricePaise: product.pricePaise,
    compareAtPaise: product.compareAtPaise,
    featured: product.featured,
    createdAt: product.createdAt,
    images: product.images,
    availableQuantity: product.variants.reduce(
      (total, variant) => total + Math.max(variant.stock - variant.reserved, 0),
      0
    )
  })).filter((product) => product.availableQuantity > 0);
  const newArrivals = products.slice(0, 8);
  const saleProducts = products.filter(
    (product) => product.compareAtPaise !== null && product.compareAtPaise > product.pricePaise
  );
  const featuredProducts = products.filter((product) => product.featured).slice(0, 8);
  const studioPiece = products[0];
  const categories = [
    { name: "Outerwear", index: "01 / LAYER UP" },
    { name: "Tailoring", index: "02 / FIND YOUR LINE" },
    { name: "Essentials", index: "03 / EVERY DAY" }
  ];

  return <main>
    <section className="container hero-wrap">
      <div className="hero">
        <Reveal className="hero-copy" delay={0.05}>
          <div className="hero-kicker"><span className="status-dot"/> Volume IV / Architectural silhouettes</div>
          <h1 className="hero-title">The purity<br/><i>of weight.</i></h1>
          <p className="hero-description">Considered materials, deliberate proportions, and pieces designed to earn their place in your everyday uniform.</p>
          <div className="hero-actions"><MotionLink className="button" href="/shop?collection=new">Explore new arrivals <span aria-hidden="true">↗</span></MotionLink><span className="hero-note">ATELIER NOIR / THE COLLECTION</span></div>
        </Reveal>
        <Reveal className="hero-image-wrap" delay={0.12}>
          <div className="hero-image" role="img" aria-label="Fashion campaign from the Atelier Noir collection">
            <span className="hero-image-label">Tactile permanence / refined restraint</span>
            <span className="hero-image-stamp">ATELIER<br/>NOIR</span>
          </div>
        </Reveal>
      </div>
      <div className="hero-caption"><span>Designed for your own rhythm.</span><span>Volume IV — Atelier Noir</span></div>
    </section>
    <div className="container brand-values" aria-label="Our approach">
      <div><span>01</span> Made with intention</div>
      <div><span>02</span> Worn on repeat</div>
      <div><span>03</span> Never overthought</div>
    </div>
    <ProductRail
      sectionId="available-on-the-rail"
      eyebrow="Just arrived"
      title="New arrivals"
      description="The latest pieces, sorted by when they joined the collection."
      products={newArrivals}
      href="/shop?collection=new"
      emptyMessage="There are no published, in-stock arrivals at the moment."
    />
    <section className="container sartorial-lab" id="sartorial-lab" aria-labelledby="sartorial-lab-title">
      <div className="sartorial-panel">
        <Reveal className="sartorial-copy">
          <div className="eyebrow">Studio / 3D sartorial lab</div>
          <h2 id="sartorial-lab-title">Form in<br/><i>motion.</i></h2>
          <p>{studioPiece
            ? `A closer study of ${studioPiece.name}, selected from the pieces currently available on the rail.`
            : "A study in proportion, material, and movement. The studio rail will feature pieces when they are published and available."}</p>
          <MotionLink className="button" href={studioPiece ? `/product/${studioPiece.slug}` : "/shop"}>
            {studioPiece ? "Discover this piece" : "Explore the collection"} <span aria-hidden="true">↗</span>
          </MotionLink>
        </Reveal>
        <SartorialStage
          src={studioPiece?.images[0]?.url ?? "/atelier-noir-campaign.webp"}
          alt={studioPiece?.images[0]?.alt ?? "Atelier Noir campaign image"}
          label={studioPiece?.name ?? "Atelier Noir / Studio study"}
        />
      </div>
    </section>
    <ProductRail
      eyebrow="A considered find"
      title="The sale rail"
      description="Current marked-down pieces, with the original price shown for clarity."
      products={saleProducts}
      href="/shop?collection=sale"
      emptyMessage="There are no published, in-stock sale pieces at the moment."
    />
    {featuredProducts.length > 0 && (
      <ProductRail
        eyebrow="Selected by the studio"
        title="Featured pieces"
        description="A closer look at the pieces highlighted by Atelier Noir."
        products={featuredProducts}
        href="/shop"
        emptyMessage="Our considered edit is coming together."
      />
    )}
    <section className="container category-section">
      <Reveal className="section-head"><div><div className="eyebrow">Curated architecture</div><h2 className="section-title">Find your form<span className="title-period">.</span></h2></div><p className="category-intro">Explore the collection by silhouette, category, and the pieces that make a wardrobe your own.</p></Reveal>
      <div className="category-grid">
        {categories.map((category, index) => {
          const piece = products.find((product) => product.category === category.name);
          return (
            <Reveal delay={0.03 + index * 0.08} key={category.name}>
              <MotionLink className="category-card" href={`/shop?category=${encodeURIComponent(category.name)}`}>
                {piece?.images[0] && <img className="category-image" src={piece.images[0].url} alt={piece.images[0].alt} loading="lazy" />}
                <span className="category-index">{category.index}</span>
                <span className="category-name">{category.name} <span aria-hidden="true">↗</span></span>
              </MotionLink>
            </Reveal>
          );
        })}
      </div>
    </section>
    <div className="ticker" aria-hidden="true">
      <div className="ticker-track" aria-hidden="true">{Array.from({ length: 2 }, (_, index) => <span className="ticker-set" key={index}><span>Tactile permanence</span><span className="ticker-star">✳</span><span>Refined restraint</span><span className="ticker-star">✳</span><span>Architectural silhouettes</span><span className="ticker-star">✳</span></span>)}</div>
    </div>
    <section className="editorial-band"><Reveal className="editorial-inner"><div className="eyebrow">Atelier Noir / The archive</div><h2 className="editorial-title">Less, but with<br/><i>intention.</i></h2><div className="editorial-bottom"><p>Clothes should feel like you.<br/>Just a little more so.</p><Link className="editorial-link" href="/journal">Explore the journal <span aria-hidden="true">↗</span></Link></div></Reveal></section>
  </main>;
}