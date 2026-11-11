"use client";

import Link from "next/link";
import { Menu, ShoppingBag, UserRound, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const MOBILE_NAV_ITEMS = [
  { href: "/shop", label: "Shop all" },
  { href: "/shop?collection=new", label: "New arrivals" },
  { href: "/shop?collection=sale", label: "Sale" },
  { href: "/shop?category=Outerwear", label: "Outerwear" },
  { href: "/shop?category=Essentials", label: "Essentials" },
  { href: "/shop?category=Tailoring", label: "Tailoring" },
  { href: "/#sartorial-lab", label: "Studio rail" },
  { href: "/journal", label: "Journal" }
];

export function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current) return;
      const target = event.target as Node;
      if (!menuRef.current.contains(target)) {
        setIsMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    const handleScroll = () => setIsScrolled(window.scrollY > 12);

    handleScroll();
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      <div className="announcement-bar">
        <span>Considered pieces. Made to stay.</span>
        <Link href="/shop">Discover the new collection <span aria-hidden="true">↗</span></Link>
      </div>
      <header className={`container header ${isScrolled ? "is-scrolled" : ""}`} aria-label="Main site header">
        <button
          type="button"
          className="mobile-menu-button"
          aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation-panel"
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          {isMenuOpen ? <X size={19} strokeWidth={1.8} /> : <Menu size={19} strokeWidth={1.8} />}
        </button>

        <div
          ref={menuRef}
          id="mobile-navigation-panel"
          className={`mobile-menu-panel ${isMenuOpen ? "open" : ""}`}
          aria-label="Mobile navigation"
        >
          {MOBILE_NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setIsMenuOpen(false)}>
              {item.label}
            </Link>
          ))}
        </div>

        <Link href="/" className="wordmark" aria-label="Atelier Noir home">ATELIER <span>NOIR</span></Link>
        <nav className="nav-desktop" aria-label="Main navigation">
          <Link className="navlink" href="/shop">Shop</Link>
          <Link className="navlink" href="/shop?collection=new">New</Link>
          <Link className="navlink" href="/shop?collection=sale">Sale</Link>
          <Link className="navlink" href="/shop?category=Outerwear">Outerwear</Link>
          <Link className="navlink" href="/#sartorial-lab">Studio</Link>
          <Link className="navlink" href="/journal">Journal</Link>
        </nav>
        <nav className="header-actions" aria-label="Account and shopping bag">
          <Link href="/account" aria-label="Account"><UserRound size={19} strokeWidth={1.5} /><span>Account</span></Link>
          <Link href="/cart" aria-label="Shopping bag"><ShoppingBag size={19} strokeWidth={1.5} /><span>Bag</span></Link>
        </nav>
      </header>
    </>
  );
}