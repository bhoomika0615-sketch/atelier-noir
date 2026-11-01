"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  pricePaise: number;
  compareAtPaise: number | null;
  published: boolean;
  featured: boolean;
  images: { url: string; alt: string }[];
  variants: { id: string; sku: string; size: string; color: string; stock: number; reserved: number }[];
};

type VariantDraft = {
  id?: string;
  sku: string;
  size: string;
  color: string;
  stock: string;
};

type ProductDraft = {
  name: string;
  slug: string;
  description: string;
  category: string;
  price: string;
  compareAt: string;
  published: boolean;
  featured: boolean;
  images: string;
  variants: VariantDraft[];
};

function draftFromProduct(product?: Product): ProductDraft {
  return {
    name: product?.name ?? "",
    slug: product?.slug ?? "",
    description: product?.description ?? "",
    category: product?.category ?? "",
    price: product ? (product.pricePaise / 100).toFixed(2) : "",
    compareAt: product?.compareAtPaise ? (product.compareAtPaise / 100).toFixed(2) : "",
    published: product?.published ?? false,
    featured: product?.featured ?? false,
    images: product?.images.map((image) => `${image.url} | ${image.alt}`).join("\n") ?? "",
    variants: product?.variants.map((variant) => ({
      id: variant.id,
      sku: variant.sku,
      size: variant.size,
      color: variant.color,
      stock: String(variant.stock)
    })) ?? [{ sku: "", size: "", color: "Black", stock: "0" }]
  };
}

function toPaise(value: string) {
  const amount = Number(value);
  return Number.isFinite(amount) ? Math.round(amount * 100) : Number.NaN;
}

function imageEntries(value: string, name: string) {
  return value.split("\n").map((line) => line.trim()).filter(Boolean).map((line, index) => {
    const [url, ...altParts] = line.split("|");
    return {
      url: url.trim(),
      alt: altParts.join("|").trim() || `${name} — view ${index + 1}`
    };
  });
}

function productPayload(draft: ProductDraft) {
  return {
    name: draft.name,
    slug: draft.slug,
    description: draft.description,
    category: draft.category,
    pricePaise: toPaise(draft.price),
    compareAtPaise: draft.compareAt ? toPaise(draft.compareAt) : null,
    published: draft.published,
    featured: draft.featured,
    images: imageEntries(draft.images, draft.name),
    variants: draft.variants.map((variant) => ({
      ...(variant.id ? { id: variant.id } : {}),
      sku: variant.sku,
      size: variant.size,
      color: variant.color,
      stock: Number(variant.stock)
    }))
  };
}

function errorFromResponse(data: unknown) {
  if (typeof data === "object" && data !== null && "error" in data && typeof data.error === "string") {
    return data.error;
  }
  return "The change could not be saved. Please try again.";
}

function ProductEditor({ product }: { product?: Product }) {
  const router = useRouter();
  const [draft, setDraft] = useState(() => draftFromProduct(product));
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  function update<K extends keyof ProductDraft>(key: K, value: ProductDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function updateVariant(index: number, key: keyof VariantDraft, value: string) {
    setDraft((current) => ({
      ...current,
      variants: current.variants.map((variant, variantIndex) =>
        variantIndex === index ? { ...variant, [key]: value } : variant
      )
    }));
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;

    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(product ? `/api/admin/products/${product.id}` : "/api/admin/products", {
        method: product ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productPayload(draft))
      });
      const data: unknown = await response.json();
      if (!response.ok) throw new Error(errorFromResponse(data));
      setMessage(product ? "Product changes saved." : "Product created.");
      if (!product) setDraft(draftFromProduct());
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The change could not be saved.");
    } finally {
      setBusy(false);
    }
  }

  async function archive() {
    if (!product || busy || !window.confirm(`Archive ${product.name}? It will no longer appear in the public shop.`)) return;

    setBusy(true);
    setMessage("");
    try {
      const response = await fetch(`/api/admin/products/${product.id}`, { method: "DELETE" });
      const data: unknown = await response.json();
      if (!response.ok) throw new Error(errorFromResponse(data));
      setMessage("Product archived. Existing order history is preserved.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The product could not be archived.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="admin-product-form" onSubmit={save} aria-busy={busy}>
      <div className="admin-product-grid">
        <label className="form-label">Product name
          <input className="field" required minLength={2} maxLength={120} value={draft.name} onChange={(event) => update("name", event.target.value)} />
        </label>
        <label className="form-label">URL slug
          <input className="field" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" maxLength={140} value={draft.slug} onChange={(event) => update("slug", event.target.value)} />
        </label>
        <label className="form-label">Category
          <input className="field" required minLength={2} maxLength={60} value={draft.category} onChange={(event) => update("category", event.target.value)} />
        </label>
        <label className="form-label">Price (INR)
          <input className="field" type="number" min="1" max="500000" step="0.01" required value={draft.price} onChange={(event) => update("price", event.target.value)} />
        </label>
        <label className="form-label">Original price (optional)
          <input className="field" type="number" min="1" max="500000" step="0.01" value={draft.compareAt} onChange={(event) => update("compareAt", event.target.value)} />
        </label>
      </div>
      <label className="form-label">Description
        <textarea className="field admin-product-description" required minLength={10} maxLength={5000} value={draft.description} onChange={(event) => update("description", event.target.value)} />
      </label>
      <label className="form-label">Image URLs
        <textarea className="field admin-product-images" value={draft.images} onChange={(event) => update("images", event.target.value)} placeholder="One URL per line; optionally add | accessible image description" />
      </label>
      <fieldset className="admin-variant-set">
        <legend className="eyebrow">Size, colour and stock variants</legend>
        {draft.variants.map((variant, index) => (
          <div className="admin-variant-row" key={variant.id ?? `new-${index}`}>
            <label className="form-label">Size
              <input className="field" required maxLength={32} value={variant.size} onChange={(event) => updateVariant(index, "size", event.target.value)} />
            </label>
            <label className="form-label">Colour
              <input className="field" required maxLength={40} value={variant.color} onChange={(event) => updateVariant(index, "color", event.target.value)} />
            </label>
            <label className="form-label">SKU
              <input className="field" required pattern="[A-Za-z0-9_-]+" maxLength={64} value={variant.sku} onChange={(event) => updateVariant(index, "sku", event.target.value)} />
            </label>
            <label className="form-label">Stock
              <input className="field" type="number" min="0" max="100000" required value={variant.stock} onChange={(event) => updateVariant(index, "stock", event.target.value)} />
            </label>
            <button className="admin-variant-remove" type="button" disabled={busy || draft.variants.length === 1} onClick={() => update("variants", draft.variants.filter((_, variantIndex) => variantIndex !== index))}>
              Remove size
            </button>
          </div>
        ))}
        <button className="admin-secondary-button" type="button" disabled={busy || draft.variants.length >= 40} onClick={() => update("variants", [...draft.variants, { sku: "", size: "", color: "Black", stock: "0" }])}>
          Add size variant
        </button>
      </fieldset>
      <div className="admin-product-flags">
        <label><input type="checkbox" checked={draft.published} onChange={(event) => update("published", event.target.checked)} /> Published in shop</label>
        <label><input type="checkbox" checked={draft.featured} onChange={(event) => update("featured", event.target.checked)} /> Featured</label>
      </div>
      <div className="admin-product-actions">
        <button className="button" type="submit" disabled={busy}>{busy ? "Saving…" : product ? "Save product" : "Create product"} <span aria-hidden="true">↗</span></button>
        {product && <button className="admin-secondary-button" type="button" disabled={busy} onClick={archive}>Archive product</button>}
      </div>
      {message && <p className="admin-product-message" role="status" aria-live="polite">{message}</p>}
    </form>
  );
}

export function AdminProductManager({ products }: { products: Product[] }) {
  return (
    <section className="admin-catalog" aria-labelledby="admin-catalog-title">
      <div className="admin-section-heading">
        <div>
          <div className="eyebrow">Product and inventory control</div>
          <h2 className="serif" id="admin-catalog-title">Catalogue</h2>
        </div>
        <span className="admin-catalog-count">{products.length} total</span>
      </div>
      <details className="admin-product-card admin-product-new" open>
        <summary>Create a product</summary>
        <ProductEditor />
      </details>
      {products.length ? products.map((product) => (
        <details className="admin-product-card" key={product.id}>
          <summary>
            <span>{product.name}</span>
            <span className={`admin-product-state${product.published ? " is-published" : ""}`}>{product.published ? "Published" : "Draft"}</span>
          </summary>
          <ProductEditor key={product.id} product={product} />
        </details>
      )) : <p className="admin-catalog-empty">No products yet. Create a product above to add the first purchasable sizes.</p>}
    </section>
  );
}
