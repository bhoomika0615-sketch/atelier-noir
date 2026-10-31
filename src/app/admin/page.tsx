import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  try {
    await requireAdmin();
  } catch {
    redirect("/admin/login");
  }

  const [products, orders, users] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.user.count()
  ]);
  const metrics = [["Products", products], ["Orders", orders], ["Customers", users]] as const;

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
      <p className="admin-note">Product management API is available to authorized administrators. See README for API usage and deployment setup.</p>
    </main>
  );
}