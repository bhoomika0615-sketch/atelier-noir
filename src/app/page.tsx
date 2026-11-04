import { prisma } from "@/lib/prisma";
import { StorefrontHome } from "@/components/storefront-home";
import type { StorefrontProduct } from "@/components/storefront-home";

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

  const products: StorefrontProduct[] = records.map((product) => ({
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

  const categoryMap = new Map<string, {
    name: string;
    count: number;
    image: StorefrontProduct["images"][number] | null;
  }>();

  for (const product of products) {
    const category = categoryMap.get(product.category) ?? {
      name: product.category,
      count: 0,
      image: product.images[0] ?? null
    };
    category.count += 1;
    if (!category.image && product.images[0]) category.image = product.images[0];
    categoryMap.set(product.category, category);
  }

  const categories = [...categoryMap.values()]
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  return <StorefrontHome products={products} categories={categories} />;
}
