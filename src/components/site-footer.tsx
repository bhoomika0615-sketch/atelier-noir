import Link from "next/link";
export function SiteFooter() {
  return <footer className="footer"><div className="container">
    <div className="footer-top">
      <div className="footer-brand"><div className="wordmark">ATELIER <span>NOIR</span></div><p>Modern menswear shaped by considered silhouettes, enduring materials and quiet confidence.</p></div>
      <nav className="footer-links" aria-label="Footer navigation"><Link href="/shop">Shop</Link><Link href="/journal">Journal</Link><Link href="/account">Account</Link><Link href="/admin/login">Admin</Link></nav>
    </div>
    <div className="footer-legal">© 2026 ATELIER NOIR. ALL RIGHTS RESERVED.</div>
  </div></footer>;
}