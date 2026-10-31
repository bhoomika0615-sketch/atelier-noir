import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: { id: true, orderNumber: true, status: true, totalPaise: true, createdAt: true }
  });

  return (
    <main className="container section account-page">
      <div className="eyebrow">Your account</div>
      <h1 className="section-title">Hello, {user.name}</h1>
      <p className="account-email">{user.email}</p>
      <section className="account-orders" aria-labelledby="order-history-title">
        <div className="account-section-heading">
          <div className="eyebrow">A record of your selection</div>
          <h2 id="order-history-title">Order history</h2>
        </div>
        {orders.length ? (
          <div className="order-list">
            {orders.map((order) => (
              <article className="order-row" key={order.id}>
                <div>
                  <span className="order-number">{order.orderNumber}</span>
                  <span className="order-status">{order.status}</span>
                </div>
                <span className="order-total">₹{(order.totalPaise / 100).toLocaleString("en-IN")}</span>
              </article>
            ))}
          </div>
        ) : (
          <div className="account-empty">
            <p>No orders yet.</p>
            <Link className="text-link" href="/shop">Discover the collection <span aria-hidden="true">↗</span></Link>
          </div>
        )}
      </section>
    </main>
  );
}