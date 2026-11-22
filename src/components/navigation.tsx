"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, Search, X } from "lucide-react";
export function Navigation() {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  return (
    <>
      <button
        type="button"
        className="menu-toggle"
        aria-label={open ? "Close navigation" : "Open navigation"}
        aria-expanded={open}
        aria-controls="market-nav"
        onClick={() => setOpen(!open)}
      >
        {open ? <X /> : <Menu />}
      </button>
      <div id="market-nav" className={"navigation" + (open ? " is-open" : "")}>
        <nav aria-label="Main navigation">
          {[
            ["/", "Home"],
            ["/products", "Apps"],
            ["/#categories", "Categories"],
            ["/about", "About"],
            ["/contact", "Contact"],
          ].map(([href, label]) => (
            <Link
              key={href}
              href={href}
              aria-current={path === href ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              {label}
            </Link>
          ))}
        </nav>
        <form
          className="global-search"
          action="/products"
          onSubmit={() => setOpen(false)}
        >
          <Search size={17} />
          <input
            name="q"
            placeholder="Search apps"
            aria-label="Search all applications"
          />
          <button aria-label="Submit search">↵</button>
        </form>
      </div>
    </>
  );
}
