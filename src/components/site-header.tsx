import Link from "next/link";
import { ShoppingBag, UserRound } from "lucide-react";

export function SiteHeader() {
  return <>
    <div className="announcement-bar">
      <span>Considered pieces. Made to stay.</span>
      <Link href="/shop">Discover the new collection <span aria-hidden="true">↗</span></Link>
    </div>
    <header className="container header">
      <details className="mobile-menu">
        <summary aria-label="Open navigation menu"><span/><span/></summary>
        <nav className="mobile-menu-panel" aria-label="Mobile navigation">
          <Link href="/shop">Shop all</Link>
          <Link href="/shop?collection=new">New arrivals</Link>
          <Link href="/shop?collection=sale">Sale</Link>
          <Link href="/shop?category=Outerwear">Outerwear</Link>
          <Link href="/shop?category=Essentials">Essentials</Link>
          <Link href="/shop?category=Tailoring">Tailoring</Link>
          <Link href="/journal">Journal</Link>
        </nav>
      </details>
      <Link href="/" className="wordmark" aria-label="Atelier Noir home">ATELIER <span>NOIR</span></Link>
      <nav className="nav-desktop" aria-label="Main navigation">
        <Link className="navlink" href="/shop">Shop</Link>
        <Link className="navlink" href="/shop?collection=new">New</Link>
        <Link className="navlink" href="/shop?collection=sale">Sale</Link>
        <Link className="navlink" href="/shop?category=Outerwear">Outerwear</Link>
        <Link className="navlink" href="/journal">Journal</Link>
      </nav>
      <nav className="header-actions" aria-label="Account and shopping bag">
        <Link href="/account" aria-label="Account"><UserRound size={19} strokeWidth={1.5}/><span>Account</span></Link>
        <Link href="/cart" aria-label="Shopping bag"><ShoppingBag size={19} strokeWidth={1.5}/><span>Bag</span></Link>
      </nav>
    </header>
  </>;
}