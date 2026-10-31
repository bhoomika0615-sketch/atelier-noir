import Link from "next/link";

export type ProductRailItem = {
  id: string;
  slug: string;
  name: string;
  category: string;
  pricePaise: number;
  compareAtPaise: number | null;
  images: { id: string; url: string; alt: string }[];
  availableQuantity: number;
};

type ProductRailProps = {
  sectionId?: string;
  eyebrow: string;
  title: string;
  description: string;
  products: ProductRailItem[];
  href: string;
  emptyMessage: string;
};

function EmptyRailDisplay() {
  return (
    <div className="product-rail-empty-display" aria-hidden="true">
      <div className="product-rail-empty-bar" />
      <div className="product-rail-empty-hangers">
        {Array.from({ length: 5 }, (_, index) => (
          <svg key={index} viewBox="0 0 100 64" fill="none">
            <path d="M50 25c0-8 12-8 12 0 0 4-3 6-7 6v5l34 21c3 2 1 6-2 6H13c-3 0-5-4-2-6l34-21v-5c-4 0-7-2-7-6" />
          </svg>
        ))}
      </div>
      <div className="product-rail-empty-caption">THE RAIL · READY FOR THE NEXT EDIT</div>
    </div>
  );
}

function formatPrice(pricePaise: number) {
  return `₹${(pricePaise / 100).toLocaleString("en-IN")}`;
}

export function ProductRail({ sectionId, eyebrow, title, description, products, href, emptyMessage }: ProductRailProps) {
  const headingId = sectionId ? `${sectionId}-heading` : undefined;

  return (
    <section
      id={sectionId}
      className="container product-rail-section"
      aria-labelledby={headingId}
    >
      <header className="product-rail-heading">
        <div>
          <div className="eyebrow">{eyebrow}</div>
          <h2 className="section-title" id={headingId}>{title}<span className="title-period">.</span></h2>
          <p>{description}</p>
        </div>
        <Link className="text-link" href={href}>Explore the edit <span aria-hidden="true">↗</span></Link>
      </header>

      {products.length ? (
        <div className="product-rail-display">
          <div className="product-rail-bar" aria-hidden="true" />
          <div className="product-rail-track" role="group" aria-label={`${products.length} available products`}>
            {products.map((product) => {
              const onSale = product.compareAtPaise !== null && product.compareAtPaise > product.pricePaise;
              const discount = onSale && product.compareAtPaise
                ? Math.round((1 - product.pricePaise / product.compareAtPaise) * 100)
                : 0;

              return (
                <Link className="product-rail-card" href={`/product/${product.slug}`} key={product.id}>
                  <div className="product-rail-image">
                    {product.images[0] ? (
                      <img src={product.images[0].url} alt={product.images[0].alt} loading="lazy" />
                    ) : (
                      <span className="product-rail-image-fallback">{product.category}</span>
                    )}
                    {onSale && <span className="product-rail-badge">-{discount}%</span>}
                    <span className="product-rail-discover">View piece <span aria-hidden="true">↗</span></span>
                  </div>
                  <div className="product-rail-meta">
                    <span>{product.category}</span>
                    {product.availableQuantity <= 3 && <span>Only {product.availableQuantity} left</span>}
                  </div>
                  <div className="product-rail-name-price">
                    <h3>{product.name}</h3>
                    <div className="product-rail-prices">
                      <span>{formatPrice(product.pricePaise)}</span>
                      {onSale && product.compareAtPaise !== null && (
                        <del>{formatPrice(product.compareAtPaise)}</del>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="product-rail-empty">
          <EmptyRailDisplay />
          <div className="product-rail-empty-copy">
            <span className="eyebrow">Nothing on the rail just yet</span>
            <p>{emptyMessage}</p>
            <Link className="text-link" href="/shop">Browse the collection <span aria-hidden="true">↗</span></Link>
          </div>
        </div>
      )}
    </section>
  );
}
