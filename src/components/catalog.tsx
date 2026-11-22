"use client";
import { useDeferredValue, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import type { Product } from "@/lib/types";
import { filterProducts, type Filters } from "@/lib/catalog";
import { ProductCard } from "./site";
export function Catalog({
  items,
  initial,
}: {
  items: Product[];
  initial: Filters;
}) {
  const [filters, setFilters] = useState(initial);
  const [limit, setLimit] = useState(12);
  const deferred = useDeferredValue(filters);
  const filtered = filterProducts(items, deferred);
  function set(key: keyof Filters, value: string) {
    const next = { ...filters, [key]: value };
    setFilters(next);
    setLimit(12);
    const params = new URLSearchParams();
    Object.entries(next).forEach(([k, v]) => {
      if (v && !(k === "sort" && v === "updated")) params.set(k, v);
    });
    window.history.replaceState(
      null,
      "",
      `/products${params.size ? `?${params}` : ""}`,
    );
  }
  return (
    <>
      <div className="catalog-controls">
        <label className="catalog-search">
          <Search size={20} />
          <input
            aria-label="Search applications"
            placeholder="Find your next useful app…"
            value={filters.q}
            onChange={(e) => set("q", e.target.value)}
          />
        </label>
        <div className="filter-row">
          <SlidersHorizontal size={18} />
          {(
            [
              [
                "category",
                "Category",
                Array.from(new Set(items.map((p) => p.category))),
              ],
              [
                "platform",
                "Platform",
                Array.from(new Set(items.map((p) => p.platform))),
              ],
              ["pricing", "Pricing", ["Free", "Paid"]],
            ] as const
          ).map(([key, label, values]) => (
            <select
              key={key}
              aria-label={label}
              value={filters[key]}
              onChange={(e) => set(key, e.target.value)}
            >
              <option value="">All {label.toLowerCase()}</option>
              {values.map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          ))}
          <select
            aria-label="Sort applications"
            value={filters.sort}
            onChange={(e) => set("sort", e.target.value)}
          >
            <option value="updated">Recently updated</option>
            <option value="name">Alphabetical</option>
          </select>
        </div>
      </div>
      <div className="results-line" role="status">
        {filtered.length}{" "}
        {filtered.length === 1 ? "application" : "applications"}
        {filters.q && ` matching “${filters.q}”`}
        <button
          onClick={() => {
            setFilters({
              q: "",
              category: "",
              platform: "",
              pricing: "",
              sort: "updated",
            });
            setLimit(12);
            window.history.replaceState(null, "", "/products");
          }}
        >
          Clear filters
        </button>
      </div>
      <div className="market-grid" aria-busy={filters !== deferred}>
        {filtered.slice(0, limit).map((p) => (
          <ProductCard key={p.id || p.slug} product={p} />
        ))}
      </div>
      {!filtered.length && (
        <div className="empty-state">
          <Search size={28} />
          <h2>
            {items.length
              ? "No matching apps"
              : "The next useful app starts here."}
          </h2>
          <p>
            {items.length
              ? "Try another search or clear the filters."
              : "Published applications will appear here as soon as they are available."}
          </p>
        </div>
      )}
      {filtered.length > limit && (
        <button className="load-more" onClick={() => setLimit(limit + 12)}>
          Load more applications
        </button>
      )}
    </>
  );
}
