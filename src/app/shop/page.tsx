import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Reveal } from "@/components/reveal";
import { MotionLink } from "@/components/motion-link";

export const dynamic = "force-dynamic";

const categories = ["All pieces", "Outerwear", "Tailoring", "Essentials"];

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ category?: string; collection?: string }> }) {
  const { category, collection } = await searchParams;
  const records = await prisma.product.findMany({
    where: { published: true, ...(category ? { category } : {}) },
    include: {
      images: { orderBy: { position: "asc" }, take: 1 },
      variants: { select: { stock: true, reserved: true } }
    },
    orderBy: { createdAt: "desc" }
  });
  let products = records.map((product) => ({
    ...product,
    availableQuantity: product.variants.reduce(
      (total, variant) => total + Math.max(variant.stock - variant.reserved, 0),
      0
    )
  })).filter((product) => product.availableQuantity > 0);

  if (collection === "sale") {
    products = products.filter(
      (product) => product.compareAtPaise !== null && product.compareAtPaise > product.pricePaise
    );
  } else if (collection === "new") {
    products = products.slice(0, 8);
  }

  const title = collection === "sale"
    ? "The sale rail"
    : collection === "new"
      ? "New arrivals"
      : category ?? "Pieces to live in";
  const filters = [
    { name: "All pieces", href: "/shop", selected: !category && !collection },
    { name: "New arrivals", href: "/shop?collection=new", selected: collection === "new" },
    { name: "Sale", href: "/shop?collection=sale", selected: collection === "sale" },
    ...categories.slice(1).map((name) => ({
      name,
      href: `/shop?category=${encodeURIComponent(name)}`,
      selected: category === name && !collection
    }))
  ];

  return (
    <main className="container shop-page">
      <Reveal className="shop-intro">
        <div className="eyebrow"><span className="shop-kicker-dot" /> Atelier Noir / The collection</div>
        <div className="shop-title-row">
          <h1 className="shop-title">{title}<span>.</span></h1>
          <p>Good clothes don’t ask for attention.<br />They just keep earning a place.</p>
        </div>
      </Reveal>

      <div className="shop-toolbar">
        <span className="shop-count">{String(products.length).padStart(2, "0")} <span>PIECES</span></span>
        <nav className="shop-filters" aria-label="Filter products by category">
          {filters.map(({ name, href, selected }) => (
            <Link key={name} href={href} className={selected ? "shop-filter is-active" : "shop-filter"} aria-current={selected ? "page" : undefined}>{name}</Link>
          ))}
        </nav>
        <span className="shop-sort-note">Available pieces · newest first</span>
      </div>

      {products.length ? (
        <div className="grid-products shop-products">
          {products.map((product, index) => (
            <Reveal className="product-reveal" delay={Math.min(index * 0.06, 0.3)} key={product.id}>
              <Link href={`/product/${product.slug}`} className="product-card">
                <div className="product-image">
                  {product.images[0] ? <img src={product.images[0].url} alt={product.images[0].alt} loading="lazy" /> : <span className="product-image-fallback">{product.category}</span>}
                  {product.compareAtPaise !== null && product.compareAtPaise > product.pricePaise && (
                    <span className="product-sale-badge">Sale</span>
                  )}
                  <span className="product-view">Discover <span aria-hidden="true">↗</span></span>
                </div>
                <div className="product-info">
                  <span>{product.name}</span>
                  <span className="product-price-stack">
                    ₹{(product.pricePaise / 100).toLocaleString("en-IN")}
                    {product.compareAtPaise !== null && product.compareAtPaise > product.pricePaise && (
                      <del>₹{(product.compareAtPaise / 100).toLocaleString("en-IN")}</del>
                    )}
                  </span>
                </div>
                <div className="product-meta">{product.category} · {product.availableQuantity} available</div>
              </Link>
            </Reveal>
          ))}
        </div>
      ) : (
        <Reveal>
          <div className="shop-empty">
            <div className="shop-empty-art" aria-hidden="true">
              <svg viewBox="0 0 220 220" fill="none">
                <path d="M37 145c15-46 26-67 65-77 38-10 58 2 82 24-13 34-28 68-72 78-30 7-51-3-75-25Z" stroke="currentColor" strokeWidth="1.2" />
                <path d="M55 150c32-21 62-42 119-55M79 168c23-30 44-56 67-84M42 126c47 9 92 20 133 47" stroke="currentColor" strokeWidth="1.2" />
                <circle cx="110" cy="111" r="83" stroke="currentColor" strokeWidth=".7" strokeDasharray="2 7" />
              </svg>
              <span>01 — 03</span>
            </div>
            <div className="shop-empty-copy">
              <div className="eyebrow">{collection === "sale" ? "No current markdowns" : "Good things take their time"}</div>
              <h2>This edit is<br /><i>coming together.</i></h2>
              <p>{collection === "sale"
                ? "There are no in-stock pieces on sale right now. Browse the latest collection instead."
                : collection === "new"
                  ? "There are no in-stock arrivals right now. Browse every available piece instead."
                  : "Our available collection is being prepared with care. Explore the journal while we get the details just right."}</p>
              <MotionLink className="button" href={collection === "sale" ? "/shop?collection=new" : collection === "new" ? "/shop" : "/journal"}>
                {collection === "sale" ? "See new arrivals" : collection === "new" ? "Browse all pieces" : "Read the journal"}
                <span aria-hidden="true">↗</span>
              </MotionLink>
            </div>
          </div>
        </Reveal>
      )}
    </main>
  );
}
