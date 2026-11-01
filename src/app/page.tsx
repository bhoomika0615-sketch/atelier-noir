import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Reveal } from "@/components/reveal";
import { MotionLink } from "@/components/motion-link";
import { ProductRail } from "@/components/product-rail";
import { TextEffect } from "@/components/motion-primitives/text-effect";

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

  return <main>
    <section className="container hero-wrap">
      <div className="hero">
        <Reveal className="hero-copy" delay={0.05}>
          <div className="hero-kicker"><span className="status-dot"/><TextEffect as="span" per="word" preset="fade-in-blur" delay={0.12} className="hero-kicker-text">The new season is here</TextEffect></div>
          <h1 className="hero-title">Quietly<br/><i>unordinary.</i></h1>
          <p className="hero-description">A different kind of daily uniform. Thoughtful layers, tactile fabrics, and forms that feel like your own.</p>
          <div className="hero-actions"><MotionLink className="button" href="/shop">Shop the collection <span aria-hidden="true">↗</span></MotionLink><span className="hero-note">AUTUMN / WINTER 2026</span></div>
        </Reveal>
        <Reveal className="hero-image-wrap" delay={0.12}>
          <div className="hero-image" role="img" aria-label="Fashion campaign from the Atelier Noir collection">
            <span className="hero-image-label">01 / THE EVERYDAY ICON</span>
            <span className="hero-image-stamp">ATELIER<br/>NOIR</span>
          </div>
        </Reveal>
      </div>
      <div className="hero-caption"><span>Designed for your own rhythm.</span><span>01 — 03</span></div>
    </section>
    <div className="container brand-values" aria-label="Our approach">
      <div><span>01</span> Made with intention</div>
      <div><span>02</span> Worn on repeat</div>
      <div><span>03</span> Never overthought</div>
    </div>
    <ProductRail
      sectionId="available-on-the-rail"
      eyebrow="The considered edit"
      title="Available on the rail"
      description="Every piece currently published and ready to choose."
      products={products}
      href="/shop"
      emptyMessage="There are no published, in-stock pieces in the catalog yet. Once a piece is published and available, it will appear here."
    />
    <ProductRail
      eyebrow="Just arrived"
      title="New arrivals"
      description="The latest pieces, sorted by when they joined the collection."
      products={newArrivals}
      href="/shop?collection=new"
      emptyMessage="There are no published, in-stock arrivals at the moment."
    />
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
      <Reveal className="section-head"><div><div className="eyebrow">Find your form</div><h2 className="section-title">A study in essentials<span className="title-period">.</span></h2></div><p className="category-intro">Pieces that work harder, wear longer, and make getting dressed feel effortless.</p></Reveal>
      <div className="category-grid">
        <Reveal delay={0.03}><MotionLink className="category-card category-outerwear" href="/shop?category=Outerwear"><span className="category-index">01 / LAYER UP</span><span className="category-name">Outerwear <span aria-hidden="true">↗</span></span></MotionLink></Reveal>
        <Reveal delay={0.11}><MotionLink className="category-card category-tailoring" href="/shop?category=Tailoring"><span className="category-index">02 / FIND YOUR LINE</span><span className="category-name">Tailoring <span aria-hidden="true">↗</span></span></MotionLink></Reveal>
        <Reveal delay={0.19}><MotionLink className="category-card category-essentials" href="/shop?category=Essentials"><span className="category-index">03 / EVERY DAY</span><span className="category-name">Essentials <span aria-hidden="true">↗</span></span></MotionLink></Reveal>
      </div>
    </section>
    <div className="ticker" aria-hidden="true">
      <div className="ticker-track" aria-hidden="true">{Array.from({ length: 2 }, (_, index) => <span className="ticker-set" key={index}><span>Made with intention</span><span className="ticker-star">✳</span><span>Worn on repeat</span><span className="ticker-star">✳</span><span>Never overthought</span><span className="ticker-star">✳</span></span>)}</div>
    </div>
    <section className="editorial-band"><Reveal className="editorial-inner"><div className="eyebrow">A point of view / Est. MMXXIV</div><h2 className="editorial-title">Less, but with<br/><i>intention.</i></h2><div className="editorial-bottom"><p>Clothes should feel like you.<br/>Just a little more so.</p><Link className="editorial-link" href="/journal">Our way of seeing <span aria-hidden="true">↗</span></Link></div></Reveal></section>
  </main>;
}