import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminProductManager } from "@/components/admin-product-manager";
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  try {
    await requireAdmin();
  } catch (error) {
    if (error instanceof Error && (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN")) {
      redirect("/admin/login");
    }
    throw error;
  }

  const [productCount, orders, users, products] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.user.count(),
    prisma.product.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        images: { orderBy: { position: "asc" } },
        variants: { orderBy: { size: "asc" } }
      }
    })
  ]);
  const metrics = [["Products", productCount], ["Orders", orders], ["Customers", users]] as const;

  return (
    <main className="container section admin-page">
      <div className="eyebrow">ATELIER NOIR / CONTROL ROOM</div>
      <h1 className="section-title">Administration</h1>
      <section className="admin-metrics" aria-label="Store overview">
        {metrics.map(([label, count]) => (
          <article className="admin-metric" key={label}>
            <div className="eyebrow">{label}</div>
            <div className="serif">{count}</div>
          </article>
        ))}
      </section>
      <AdminProductManager products={products} />
      <p className="admin-note">Product image URLs must point to an existing public image. Configure managed image storage before launch; uploads are not enabled in this environment.</p>
    </main>
  );
}