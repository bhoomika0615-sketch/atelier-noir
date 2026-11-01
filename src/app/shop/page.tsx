import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Reveal } from "@/components/reveal";
import { MotionLink } from "@/components/motion-link";

export const dynamic = "force-dynamic";

const categories = ["All pieces", "Outerwear", "Tailoring", "Essentials"];
const sortOptions = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" }
] as const;

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ category?: string; collection?: string; q?: string; sort?: string; page?: string }> }) {
  const { category, collection, q, sort, page: pageParam } = await searchParams;
  const query = q?.trim().slice(0, 100) ?? "";
  const selectedSort = sortOptions.find((option) => option.value === sort)?.value ?? "newest";
  const records = await prisma.product.findMany({
    where: {
      published: true,
      ...(category ? { category } : {}),
      ...(query ? {
        OR: [
          { name: { contains: query } },
          { description: { contains: query } },
          { category: { contains: query } }
        ]
      } : {})
    },
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

  if (selectedSort === "oldest") {
    products.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  } else if (selectedSort === "price-asc") {
    products.sort((a, b) => a.pricePaise - b.pricePaise);
  } else if (selectedSort === "price-desc") {
    products.sort((a, b) => b.pricePaise - a.pricePaise);
  }

  const totalProducts = products.length;
  const pageSize = 24;
  const pageCount = Math.max(1, Math.ceil(totalProducts / pageSize));
  const requestedPage = Number.parseInt(pageParam ?? "1", 10);
  const currentPage = Number.isSafeInteger(requestedPage) && requestedPage > 0
    ? Math.min(requestedPage, pageCount)
    : 1;
  const visibleProducts = products.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const title = query
    ? `Search / ${query}`
    : collection === "sale"
      ? "The sale rail"
      : collection === "new"
        ? "New arrivals"
        : category ?? "Pieces to live in";
  function filterHref(next: { category?: string; collection?: string; page?: number }) {
    const params = new URLSearchParams();
    const nextCategory = "category" in next ? next.category : category;
    const nextCollection = "collection" in next ? next.collection : collection;
    if (nextCategory) params.set("category", nextCategory);
    if (nextCollection) params.set("collection", nextCollection);
    if (query) params.set("q", query);
    if (selectedSort !== "newest") params.set("sort", selectedSort);
    if (next.page && next.page > 1) params.set("page", String(next.page));
    const search = params.toString();
    return search ? `/shop?${search}` : "/shop";
  }
  const filters = [
    { name: "All pieces", href: filterHref({ category: undefined, collection: undefined }), selected: !category && !collection },
    { name: "New arrivals", href: filterHref({ category: undefined, collection: "new" }), selected: collection === "new" },
    { name: "Sale", href: filterHref({ category: undefined, collection: "sale" }), selected: collection === "sale" },
    ...categories.slice(1).map((name) => ({
      name,
      href: filterHref({ category: name, collection: undefined }),
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
        <span className="shop-count">{String(totalProducts).padStart(2, "0")} <span>PIECES</span></span>
        <nav className="shop-filters" aria-label="Filter products by category">
          {filters.map(({ name, href, selected }) => (
            <Link key={name} href={href} className={selected ? "shop-filter is-active" : "shop-filter"} aria-current={selected ? "page" : undefined}>{name}</Link>
          ))}
        </nav>
      </div>

      <form className="shop-search-sort" action="/shop" method="get">
        {category && <input type="hidden" name="category" value={category} />}
        {collection && <input type="hidden" name="collection" value={collection} />}
        <label className="shop-search-label">
          Search the collection
          <input type="search" name="q" maxLength={100} defaultValue={query} placeholder="Try a style or category" />
        </label>
        <label className="shop-sort-label">
          Sort by
          <select name="sort" defaultValue={selectedSort}>
            {sortOptions.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
          </select>
        </label>
        <button className="shop-search-submit" type="submit">Update collection</button>
      </form>

      {visibleProducts.length ? (
        <div className="grid-products shop-products">
          {visibleProducts.map((product, index) => (
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
            <div className="eyebrow">{query ? "No matching pieces" : collection === "sale" ? "No current markdowns" : "Good things take their time"}</div>
            <h2>{query ? <>Nothing found<br /><i>this time.</i></> : <>This edit is<br /><i>coming together.</i></>}</h2>
            <p>{query
              ? `No available pieces match “${query}”. Try a different search or browse every piece.`
              : collection === "sale"
              ? "There are no in-stock pieces on sale right now. Browse the latest collection instead."
              : collection === "new"
                ? "There are no in-stock arrivals right now. Browse every available piece instead."
                : "Our available collection is being prepared with care. Explore the journal while we get the details just right."}</p>
            <MotionLink className="button" href={query ? "/shop" : collection === "sale" ? "/shop?collection=new" : collection === "new" ? "/shop" : "/journal"}>
              {query ? "Browse all pieces" : collection === "sale" ? "See new arrivals" : collection === "new" ? "Browse all pieces" : "Read the journal"}
                <span aria-hidden="true">↗</span>
              </MotionLink>
            </div>
          </div>
        </Reveal>
      )}
      {pageCount > 1 && (
        <nav className="shop-pagination" aria-label="Collection pages">
          <span>Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, totalProducts)} of {totalProducts}</span>
          <div>
            {currentPage > 1
              ? <Link className="shop-page-link" href={filterHref({ page: currentPage - 1 })}>Previous</Link>
              : <span className="shop-page-link is-disabled">Previous</span>}
            <span className="shop-page-indicator">Page {currentPage} of {pageCount}</span>
            {currentPage < pageCount
              ? <Link className="shop-page-link" href={filterHref({ page: currentPage + 1 })}>Next</Link>
              : <span className="shop-page-link is-disabled">Next</span>}
          </div>
        </nav>
      )}
    </main>
  );
}
