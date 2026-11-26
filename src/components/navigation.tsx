"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, Search, X } from "lucide-react";
export function Navigation() {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const search = useRef<HTMLInputElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    function handle(event: KeyboardEvent) {
      if (document.querySelector("dialog[open]")) return;
      const target = event.target as HTMLElement;
      const editing =
        target.isContentEditable ||
        ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
      if (
        (event.key === "k" && (event.ctrlKey || event.metaKey)) ||
        (event.key === "/" && !editing)
      ) {
        event.preventDefault();
        setOpen(true);
        requestAnimationFrame(() => search.current?.focus());
      }
      if (event.key === "Escape" && open) {
        setOpen(false);
        toggle.current?.focus();
      }
    }
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [open]);
  return (
    <>
      <button
        type="button"
        ref={toggle}
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
            ref={search}
            name="q"
            placeholder="Search apps"
            aria-label="Search all applications"
          />
          <button aria-label="Submit search">
            <kbd>/</kbd>
          </button>
        </form>
      </div>
    </>
  );
}
