import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Boxes, Github, MessageCircle } from "lucide-react";
import { Product } from "@/lib/types";
import { Navigation } from "./navigation";
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
    <header className="market-header">
      <div className="wrap header-inner">
        <Logo />
        <Navigation />
      </div>
    </header>
  );
}
export function Footer() {
  return (
    <footer className="wrap marketplace-footer">
      <div>
        <Logo />
        <p>Engineering Ideas Into Reality.</p>
        <p>Thoughtfully engineered software for everyday life.</p>
      </div>
      <div>
        <h3>Discover</h3>
        <Link href="/products">All applications</Link>
        <Link href="/#categories">Categories</Link>
      </div>
      <div>
        <h3>The studio</h3>
        <Link href="/about">About Radman Labs</Link>
        <Link href="/contact">Contact</Link>
        <Link href="/admin">Owner dashboard</Link>
      </div>
      <div>
        <h3>Connect</h3>
        <a
          href="https://github.com/rohullahr914-pixel"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub ↗
        </a>
        <a
          href="https://wa.me/93707763729"
          target="_blank"
          rel="noopener noreferrer"
        >
          WhatsApp ↗
        </a>
      </div>
      <small>
        © {new Date().getFullYear()} Radman Labs · Built with purpose.
      </small>
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
export function ProductCard({
  product,
  downloadUrl,
}: {
  product: Product;
  downloadUrl?: string;
}) {
  return (
    <article className="market-card">
      <Link href={`/products/${product.slug}`} className="app-card-main">
        <div className="app-card-heading">
          <ProductIcon product={product} />
          <div>
            <span className="card-category">{product.category}</span>
            <h3>{product.name}</h3>
            <span className="muted">Radman Labs</span>
          </div>
        </div>
        <p>{product.description}</p>
      </Link>
      <div className="app-labels">
        <span>{product.platform}</span>
        <span>{product.pricing}</span>
        {product.version && <span>{product.version}</span>}
      </div>
      <div className="card-actions">
        <Link href={`/products/${product.slug}`}>
          View Details <ArrowUpRight size={15} />
        </Link>
        {downloadUrl && (
          <a href={downloadUrl} className="compact-download">
            Download ↓
          </a>
        )}
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
      Development preview · Supabase is not connected. Product information is
      from the supplied brief; downloads use live GitHub releases.
    </p>
  ) : mode === "unconfigured" ? (
    <p className="notice">
      The app catalog is being prepared. Check back soon.
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
        Explore Apps <ArrowUpRight size={17} />
      </Link>
    </Button>
  );
}
