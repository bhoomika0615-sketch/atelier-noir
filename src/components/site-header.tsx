import Link from "next/link";
import { Search, ShoppingBag, UserRound } from "lucide-react";

export function SiteHeader() {
  return <>
    <header className="street-header">
      <div className="street-topline" aria-label="Atelier Noir current collection">
        <div className="street-topline-track" aria-hidden="true">
          {Array.from({ length: 2 }, (_, index) => (
            <span className="street-topline-set" key={index}>
              <span>ATELIER NOIR / THE CURRENT EDIT</span><span>✳</span>
              <span>CONSIDERED PIECES, MADE TO BE WORN</span><span>✳</span>
              <span>EXPLORE THE COLLECTION</span><span>✳</span>
            </span>
          ))}
        </div>
      </div>
      <div className="street-header-main">
        <details className="street-mobile-menu">
          <summary aria-label="Open navigation menu"><span/><span/></summary>
          <nav className="street-mobile-panel" aria-label="Mobile navigation">
            <Link href="/shop">Shop all</Link>
            <Link href="/shop?collection=new">New arrivals</Link>
            <Link href="/shop?collection=sale">Sale</Link>
            <Link href="/journal">Journal</Link>
            <Link href="/account">Account</Link>
          </nav>
        </details>
        <Link href="/" className="street-wordmark" aria-label="Atelier Noir home">ATELIER <span>NOIR</span></Link>
        <form className="street-header-search" action="/shop" method="get" role="search">
          <Search size={17} aria-hidden="true" />
          <input type="search" name="q" maxLength={100} placeholder="Search pieces, categories..." aria-label="Search the collection" />
          <button type="submit">Search</button>
        </form>
        <nav className="street-header-actions" aria-label="Account and shopping bag">
          <Link href="/account" aria-label="Customer account"><UserRound size={19} strokeWidth={1.7}/><span>Account</span></Link>
          <Link href="/cart" aria-label="Shopping bag"><ShoppingBag size={19} strokeWidth={1.7}/><span>Bag</span></Link>
        </nav>
      </div>
      <nav className="street-category-nav" aria-label="Main navigation">
        <Link href="/shop">Shop all</Link>
        <Link href="/shop?collection=new">New releases</Link>
        <Link href="/shop?collection=sale">Sale</Link>
        <Link href="/journal">Journal</Link>
        <Link href="/account">Track your order</Link>
      </nav>
    </header>
  </>;
}