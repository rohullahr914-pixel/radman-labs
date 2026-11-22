import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Boxes, Github, MessageCircle } from "lucide-react";
import { Product } from "@/lib/types";
import { Button } from "./ui/button";
export function Logo() {
  return (
    <Link href="/" className="logo" aria-label="Radman Labs home">
      <svg
        viewBox="0 0 40 40"
        width="36"
        height="36"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M7 32V8h16l10 10-10 0 10 14H22L12 18h11l-5-5h-6v19Z"
          fill="#34d399"
        />
      </svg>
      <span>
        radman<span className="muted">labs</span>
      </span>
    </Link>
  );
}
export function Header() {
  return (
    <header className="header wrap">
      <Logo />
      <nav aria-label="Main navigation">
        <Link href="/products">Products</Link>
        <Link href="/about">About</Link>
        <Link href="/contact">
          Contact <ArrowUpRight size={14} />
        </Link>
      </nav>
    </header>
  );
}
export function Footer() {
  return (
    <footer className="wrap footer">
      <Logo />
      <p>Independent ideas. Thoughtful engineering.</p>
      <div>
        <Link href="/contact">Get in touch ↗</Link>
        <Link href="/admin">Admin</Link>
        <span>© {new Date().getFullYear()} Radman Labs</span>
      </div>
    </footer>
  );
}
export function ProductIcon({ product }: { product: Product }) {
  return product.icon_url ? (
    <Image
      className="app-icon"
      src={product.icon_url}
      width={72}
      height={72}
      alt={`${product.name} icon`}
    />
  ) : (
    <div className="app-icon placeholder" aria-hidden="true">
      <Boxes size={32} />
    </div>
  );
}
export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="product-card">
      <div className="card-top">
        <ProductIcon product={product} />
        <span className="pill">{product.pricing}</span>
      </div>
      <div className="eyebrow">
        {product.category} / {product.platform}
      </div>
      <h3>{product.name}</h3>
      <p>{product.description}</p>
      <div className="card-bottom">
        <span>{product.version || "Release on GitHub"}</span>
        <Link href={`/products/${product.slug}`}>
          View details <ArrowUpRight size={18} />
        </Link>
      </div>
    </article>
  );
}
export function ContactCards() {
  return (
    <div className="contact-grid">
      <a
        className="panel contact-card"
        href="https://github.com/rohullahr914-pixel"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Github />
        <h3>Follow the work</h3>
        <p>Explore projects and releases on GitHub.</p>
        <span>Visit GitHub ↗</span>
      </a>
      <a
        className="panel contact-card"
        href="https://wa.me/93707763729"
        target="_blank"
        rel="noopener noreferrer"
      >
        <MessageCircle />
        <h3>Start a conversation</h3>
        <p>Have an idea or a question? Connect on WhatsApp.</p>
        <span>Open WhatsApp ↗</span>
      </a>
    </div>
  );
}
export function SetupNotice({ mode }: { mode: string }) {
  return mode === "preview" ? (
    <p className="notice">
      Preview catalog · Supabase is not connected. Product information is from
      the supplied brief; downloads use live GitHub releases.
    </p>
  ) : mode === "error" ? (
    <p className="notice" role="status">
      The catalog is temporarily unavailable. Please try again shortly.
    </p>
  ) : null;
}
export function Explore() {
  return (
    <Button asChild>
      <Link href="/products">
        Explore products <ArrowUpRight size={17} />
      </Link>
    </Button>
  );
}
