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
  eyebrow: string;
  title: string;
  description: string;
  products: ProductRailItem[];
  href: string;
  emptyMessage: string;
};

function formatPrice(pricePaise: number) {
  return `₹${(pricePaise / 100).toLocaleString("en-IN")}`;
}

export function ProductRail({ eyebrow, title, description, products, href, emptyMessage }: ProductRailProps) {
  return (
    <section id="available-on-the-rail" className="container product-rail-section" aria-label={title}>
      <header className="product-rail-heading">
        <div>
          <div className="eyebrow">{eyebrow}</div>
          <h2 className="section-title">{title}<span className="title-period">.</span></h2>
          <p>{description}</p>
        </div>
        <Link className="text-link" href={href}>Explore the edit <span aria-hidden="true">↗</span></Link>
      </header>

      {products.length ? (
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
      ) : (
        <div className="product-rail-empty">
          <span className="eyebrow">The rail is being prepared</span>
          <p>{emptyMessage}</p>
          <Link className="text-link" href="/shop">Browse the collection <span aria-hidden="true">↗</span></Link>
        </div>
      )}
    </section>
  );
}
