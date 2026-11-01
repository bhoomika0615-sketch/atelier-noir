import type { MetadataRoute } from "next";

export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  const appUrl = process.env.APP_URL;
  if (!appUrl) throw new Error("APP_URL must be set to the canonical site origin before serving robots.txt.");

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/account", "/admin/", "/api/", "/cart", "/login", "/register"]
    },
    sitemap: new URL("/sitemap.xml", appUrl).toString()
  };
}
