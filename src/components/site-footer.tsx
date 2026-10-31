import Link from "next/link";
export function SiteFooter() {
  return <footer className="footer"><div className="container">
    <div className="footer-top">
      <div className="footer-brand"><div className="wordmark">ATELIER <span>NOIR</span></div><p>Modern menswear shaped by considered silhouettes, enduring materials and quiet confidence.</p></div>
      <div className="footer-links"><Link href="/shop">Shop</Link><Link href="/journal">Journal</Link><Link href="/account">Account</Link><Link href="/admin/login">Admin</Link></div>
    </div>
    <div className="footer-legal">© 2026 ATELIER NOIR. ALL RIGHTS RESERVED.</div>
  </div></footer>;
}