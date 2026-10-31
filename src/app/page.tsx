import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Reveal } from "@/components/reveal";
import { MotionLink } from "@/components/motion-link";

export const dynamic = "force-dynamic";
export default async function HomePage() {
  const products = await prisma.product.findMany({ where:{published:true}, include:{images:{orderBy:{position:"asc"},take:1}}, orderBy:{createdAt:"desc"}, take:4 });
  return <main>
    <section className="container hero-wrap">
      <div className="hero">
        <Reveal className="hero-copy" delay={0.05}>
          <div className="hero-kicker"><span className="status-dot"/> The new season is here</div>
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
    <section className="container section collection-section">
      <Reveal className="section-head"><div><div className="eyebrow">Less, but better</div><h2 className="section-title">The considered edit<span className="title-period">.</span></h2></div><Link className="text-link" href="/shop">Explore all pieces <span aria-hidden="true">↗</span></Link></Reveal>
      {products.length ? <div className="grid-products">{products.map((p, index)=><Reveal className="product-reveal" delay={index * 0.08} key={p.id}><Link href={`/product/${p.slug}`} className="product-card">
        <div className="product-image">{p.images[0] && <img src={p.images[0].url} alt={p.images[0].alt} loading="lazy"/>}<span className="product-view">Discover <span aria-hidden="true">↗</span></span></div>
        <div className="product-info"><span>{p.name}</span><span>₹{(p.pricePaise/100).toLocaleString("en-IN")}</span></div><div className="product-meta">{p.category}</div>
      </Link></Reveal>)}</div> : <Reveal><div className="empty-collection"><span className="eyebrow">A wardrobe, in the making</span><p>The first collection is being prepared. In the meantime, discover the pieces and ideas behind Atelier Noir.</p><Link className="text-link" href="/journal">Read our journal <span aria-hidden="true">↗</span></Link></div></Reveal>}
    </section>
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