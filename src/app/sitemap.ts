import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const appUrl = process.env.APP_URL;
  if (!appUrl) throw new Error("APP_URL must be set to the canonical site origin before serving sitemap.xml.");

  const baseUrl = new URL(appUrl);
  const products = await prisma.product.findMany({
    where: { published: true },
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: "desc" }
  });

  const pages = ["/", "/shop", "/journal"];
  return [
    ...pages.map((path) => ({
      url: new URL(path, baseUrl).toString(),
      changeFrequency: path === "/" ? "weekly" as const : "monthly" as const,
      priority: path === "/" ? 1 : 0.7
    })),
    ...products.map((product) => ({
      url: new URL(`/product/${encodeURIComponent(product.slug)}`, baseUrl).toString(),
      lastModified: product.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8
    }))
  ];
}
