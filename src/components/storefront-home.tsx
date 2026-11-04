import Link from "next/link";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { MotionLink } from "@/components/motion-link";
import { ProductRail } from "@/components/product-rail";
import { Reveal } from "@/components/reveal";

type StorefrontImage = {
  id: string;
  url: string;
  alt: string;
};

export type StorefrontProduct = {
  id: string;
  slug: string;
  name: string;
  category: string;
  pricePaise: number;
  compareAtPaise: number | null;
  featured: boolean;
  createdAt: Date;
  images: StorefrontImage[];
  availableQuantity: number;
};

type StorefrontCategory = {
  name: string;
  count: number;
  image: StorefrontImage | null;
};

function formatPrice(pricePaise: number) {
  return `₹${(pricePaise / 100).toLocaleString("en-IN")}`;
}

function ProductTile({ product, index }: { product: StorefrontProduct; index: number }) {
  const onSale = product.compareAtPaise !== null && product.compareAtPaise > product.pricePaise;
  const discount = onSale && product.compareAtPaise
    ? Math.round((1 - product.pricePaise / product.compareAtPaise) * 100)
    : 0;

  return (
    <Reveal className="street-product-reveal" delay={Math.min(index * 0.045, 0.22)}>
      <Link className="street-product-card" href={`/product/${product.slug}`}>
        <div className="street-product-image">
          {product.images[0]
            ? <img src={product.images[0].url} alt={product.images[0].alt} loading="lazy" />
            : <span>{product.category}</span>}
          {onSale && <span className="street-product-sale">SAVE {discount}%</span>}
          <span className="street-product-quick">Choose a size <ArrowUpRight size={15} aria-hidden="true" /></span>
        </div>
        <div className="street-product-meta">
          <span>{product.category}</span>
          {product.availableQuantity <= 3 && <span>Only {product.availableQuantity} left</span>}
        </div>
        <div className="street-product-title-price">
          <h3>{product.name}</h3>
          <span>{formatPrice(product.pricePaise)}</span>
        </div>
        {onSale && product.compareAtPaise !== null && (
          <p className="street-product-was">Original price <del>{formatPrice(product.compareAtPaise)}</del></p>
        )}
      </Link>
    </Reveal>
  );
}

function CategoryBand({ category, index }: { category: StorefrontCategory; index: number }) {
  const align = index % 2 === 0 ? "category-band-left" : "category-band-right";

  return (
    <section className={`category-band ${align}`} aria-label={`${category.name} collection`}>
      {category.image && <img src={category.image.url} alt="" className="category-band-image" loading="lazy" />}
      <div className="category-band-scrim" />
      <Reveal className="category-band-copy">
        <span className="street-eyebrow">ATELIER NOIR / {String(index + 1).padStart(2, "0")}</span>
        <h2>{category.name}</h2>
        <p>{category.count} available {category.count === 1 ? "piece" : "pieces"} in this edit.</p>
        <Link className="street-button" href={`/shop?category=${encodeURIComponent(category.name)}`}>
          Explore the edit <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
      </Reveal>
    </section>
  );
}

export function StorefrontHome({
  products,
  categories,
}: {
  products: StorefrontProduct[];
  categories: StorefrontCategory[];
}) {
  const newArrivals = products.slice(0, 8);
  const featuredProducts = products.filter((product) => product.featured).slice(0, 4);
  const lowStockProducts = products.filter((product) => product.availableQuantity <= 3).slice(0, 4);
  const saleProducts = products.filter(
    (product) => product.compareAtPaise !== null && product.compareAtPaise > product.pricePaise
  );
  const featureProduct = featuredProducts[0] ?? newArrivals[0];
  const editCategories = categories.slice(0, 4);

  return (
    <main className="street-home">
      <section className="street-hero" aria-labelledby="street-hero-title">
        <div className="street-hero-image" role="img" aria-label="Atelier Noir seasonal campaign" />
        <div className="street-hero-shade" />
        <Reveal className="street-hero-copy">
          <span className="street-hero-tag">THE ATELIER NOIR EDIT / 2026</span>
          <h1 id="street-hero-title">The warm up<br /><span>before the drop.</span></h1>
          <p>Everyday pieces. Unordinary point of view. Find your next favourite in the latest Atelier Noir edit.</p>
          <div className="street-hero-actions">
            <MotionLink className="street-button street-button-light" href="/shop">
              Explore the collection <ArrowUpRight size={16} aria-hidden="true" />
            </MotionLink>
            <Link className="street-button street-button-quiet" href="/shop?collection=new">
              New arrivals <ArrowDownRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </Reveal>
        <div className="street-hero-index"><span>ATELIER NOIR</span><span>01 — THE CURRENT EDIT</span></div>
      </section>

      <section className="street-rail-section" id="clothing-rail-section" aria-labelledby="street-rail-title">
        <div className="street-section-heading">
          <div>
            <span className="street-eyebrow">Studio archive / available now</span>
            <h2 id="street-rail-title">The physical clothing rail</h2>
            <p>Every piece on the rail is published, in stock, and ready to explore.</p>
          </div>
          <Link className="street-text-link" href="/shop">Shop all pieces <ArrowUpRight size={15} aria-hidden="true" /></Link>
        </div>
        <ProductRail
          eyebrow="The current edit"
          title="On the rail"
          description="Select a piece to inspect its details and available sizes."
          products={products.slice(0, 8)}
          href="/shop"
          emptyMessage="New pieces are being prepared for the rail. Check back soon."
        />
      </section>

      {editCategories.slice(0, 2).map((category, index) => (
        <CategoryBand key={category.name} category={category} index={index} />
      ))}

      {editCategories.length > 0 && (
        <section className="street-category-section" aria-labelledby="street-category-title">
          <div className="street-section-heading">
            <div>
              <span className="street-eyebrow">Find your next uniform</span>
              <h2 id="street-category-title">Explore by category</h2>
            </div>
            <span className="street-section-note">ATELIER NOIR / THE CATALOGUE</span>
          </div>
          <div className="street-category-grid">
            {editCategories.map((category, index) => (
              <Reveal className="street-category-reveal" key={category.name} delay={index * 0.06}>
                <Link
                  className="street-category-card"
                  href={`/shop?category=${encodeURIComponent(category.name)}`}
                >
                  {category.image && <img src={category.image.url} alt="" loading="lazy" />}
                  <span className="street-category-index">{String(index + 1).padStart(2, "0")} / {category.count} PIECES</span>
                  <span className="street-category-copy">
                    <span className="street-eyebrow">THE ATELIER NOIR EDIT</span>
                    <strong>{category.name}</strong>
                  </span>
                  <ArrowUpRight className="street-category-arrow" size={20} aria-hidden="true" />
                </Link>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {lowStockProducts.length > 0 && (
        <section className="street-low-stock" aria-labelledby="low-stock-title">
          <div className="street-low-stock-image" />
          <div className="street-low-stock-shade" />
          <Reveal className="street-low-stock-copy">
            <span className="street-low-stock-tag">LIMITED AVAILABILITY</span>
            <h2 id="low-stock-title">Pieces almost gone.</h2>
            <p>These pieces have limited stock in the current edit. Check available sizes before they’re gone.</p>
            <Link className="street-button street-button-light" href={`/product/${lowStockProducts[0].slug}`}>
              Find your size <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </Reveal>
        </section>
      )}

      {(featuredProducts.length > 0 || newArrivals.length > 0) && (
        <section className="street-products-section" aria-labelledby="street-featured-title">
          <div className="street-section-heading">
            <div>
              <span className="street-eyebrow">Selected by the studio</span>
              <h2 id="street-featured-title">Match the mood</h2>
              <p>Considered pieces from the Atelier Noir catalogue.</p>
            </div>
            <Link className="street-text-link" href="/shop">View the collection <ArrowUpRight size={15} aria-hidden="true" /></Link>
          </div>
          <div className="street-product-grid street-product-grid-four">
            {(featuredProducts.length ? featuredProducts : newArrivals.slice(0, 4)).map((product, index) => (
              <ProductTile key={product.id} product={product} index={index} />
            ))}
          </div>
        </section>
      )}

      {editCategories.length > 0 && (
        <section className="street-look-section" aria-labelledby="street-look-title">
          <div className="street-look-intro">
            <span className="street-eyebrow">A closer look at the edit</span>
            <h2 id="street-look-title">Shop the collection</h2>
            <p>Explore each edit and find the pieces that make a look your own.</p>
          </div>
          <div className="street-look-grid">
            {editCategories.map((category, index) => (
              <Link className="street-look-card" href={`/shop?category=${encodeURIComponent(category.name)}`} key={category.name}>
                {category.image && <img src={category.image.url} alt="" loading="lazy" />}
                <span className="street-look-number">EDIT / {String(index + 1).padStart(2, "0")}</span>
                <span className="street-look-caption">{category.name}<ArrowUpRight size={16} aria-hidden="true" /></span>
              </Link>
            ))}
          </div>
          <div className="street-look-action">
            <Link className="street-button" href="/shop">Explore every piece <ArrowUpRight size={16} aria-hidden="true" /></Link>
          </div>
        </section>
      )}

      <div className="street-marquee" aria-label="Atelier Noir: considered pieces, made to be worn">
        <div className="street-marquee-track" aria-hidden="true">
          {Array.from({ length: 2 }, (_, index) => (
            <span className="street-marquee-set" key={index}>
              <span>Considered pieces</span><span className="street-marquee-star">✳</span>
              <span>Made to be worn</span><span className="street-marquee-star">✳</span>
              <span>ATELIER NOIR</span><span className="street-marquee-star">✳</span>
            </span>
          ))}
        </div>
      </div>

      <section className="street-products-section street-new-release" aria-labelledby="street-new-title">
        <div className="street-section-heading">
          <div>
            <span className="street-eyebrow">The latest edit</span>
            <h2 id="street-new-title">New releases &amp; favourites</h2>
          </div>
          <Link className="street-text-link" href="/shop?collection=new">View the full edit <ArrowUpRight size={15} aria-hidden="true" /></Link>
        </div>
        {newArrivals.length > 0 ? (
          <div className="street-product-grid">
            {newArrivals.map((product, index) => <ProductTile key={product.id} product={product} index={index} />)}
          </div>
        ) : (
          <div className="street-empty">
            <span className="street-eyebrow">The next drop is taking shape</span>
            <p>There are no published, in-stock pieces just yet. Check back when the next edit arrives.</p>
            <Link className="street-text-link" href="/journal">Read the journal <ArrowUpRight size={15} aria-hidden="true" /></Link>
          </div>
        )}
      </section>

      {featureProduct && (
        <section className="street-feature-banner">
          {featureProduct.images[0] && <img src={featureProduct.images[0].url} alt="" loading="lazy" />}
          <div className="street-feature-shade" />
          <Reveal className="street-feature-copy">
            <span className="street-eyebrow">A closer look / Atelier Noir</span>
            <h2>{featureProduct.name}</h2>
            <p>{featureProduct.category} / {formatPrice(featureProduct.pricePaise)}</p>
            <Link className="street-button street-button-light" href={`/product/${featureProduct.slug}`}>
              Discover the piece <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </Reveal>
        </section>
      )}

      {saleProducts.length > 0 && (
        <section className="street-products-section" aria-labelledby="street-sale-title">
          <div className="street-section-heading">
            <div>
              <span className="street-eyebrow">A considered find</span>
              <h2 id="street-sale-title">The sale edit</h2>
            </div>
            <Link className="street-text-link" href="/shop?collection=sale">Explore the sale <ArrowUpRight size={15} aria-hidden="true" /></Link>
          </div>
          <div className="street-product-grid">
            {saleProducts.slice(0, 4).map((product, index) => <ProductTile key={product.id} product={product} index={index} />)}
          </div>
        </section>
      )}

      <section className="street-manifesto" aria-labelledby="street-manifesto-title">
        <div className="street-manifesto-inner">
          <span className="street-eyebrow">The Atelier Noir point of view</span>
          <h2 id="street-manifesto-title">Wear it your way.<br /><span>Make it your own.</span></h2>
          <div className="street-manifesto-copy">
            <p>Atelier Noir is built around thoughtful layers, tactile fabrics, and forms that feel like your own. A different kind of daily uniform, selected with intention.</p>
            <Link className="street-button street-button-light" href="/journal">Read our journal <ArrowUpRight size={16} aria-hidden="true" /></Link>
          </div>
        </div>
      </section>

      <section className="street-story-section" aria-labelledby="street-story-title">
        <div className="street-story-intro">
          <span className="street-eyebrow">The Atelier Noir approach</span>
          <h2 id="street-story-title">Good clothes earn their place.</h2>
          <p>Explore the edit, choose your fit, and find the details before adding a piece to your bag.</p>
        </div>
        <div className="street-pillars">
          {[
            ["01", "Considered pieces", "A thoughtful collection of modern everyday menswear."],
            ["02", "Details matter", "Product pages show the price, description, colours, sizes, and current availability."],
            ["03", "A clear checkout", "Your bag and checkout use the store’s existing account and payment flows."],
          ].map(([number, title, description]) => (
            <article className="street-pillar" key={number}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
        <div className="street-faq">
          <h3>Frequently asked questions</h3>
          <details className="street-faq-item">
            <summary>How do I choose a size?</summary>
            <p>Open a product to see its available colours and sizes. Choose an available variant before adding it to your bag.</p>
          </details>
          <details className="street-faq-item">
            <summary>Can I see what is currently in stock?</summary>
            <p>The collection shows only published items with stock available. Product pages show variant availability before you add a piece.</p>
          </details>
          <details className="street-faq-item">
            <summary>How do I review or update my bag?</summary>
            <p>Open your bag from the header to review your selection and continue to checkout.</p>
          </details>
        </div>
      </section>
    </main>
  );
}
