import type { Metadata } from "next";
import { products } from "@/lib/products";
import { ProductCard, SetupNotice } from "@/components/site";
export const metadata: Metadata = {
  title: "Products",
  description: "Explore applications by Radman Labs.",
};
export const dynamic = "force-dynamic";
export default async function Catalog({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { q = "", category = "" } = await searchParams;
  const { items, mode } = await products();
  const filtered = items.filter(
    (p) =>
      (!category || p.category === category) &&
      `${p.name} ${p.description}`.toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <div className="wrap">
      <div className="page-head">
        <div className="eyebrow">The product collection</div>
        <h1>Software with purpose.</h1>
        <p>Discover practical applications, thoughtfully engineered.</p>
      </div>
      <SetupNotice mode={mode} />
      <form className="filters">
        <input
          name="q"
          aria-label="Search applications"
          placeholder="Search applications…"
          defaultValue={q}
        />
        <select name="category" aria-label="Category" defaultValue={category}>
          <option value="">All categories</option>
          {Array.from(new Set([...items.map((p) => p.category), category]))
            .filter(Boolean)
            .map((c) => (
              <option key={c}>{c}</option>
            ))}
        </select>
        <button className="rounded-lg bg-emerald-400 px-5 py-2 text-slate-950 font-semibold">
          Search
        </button>
      </form>
      <div className="product-grid">
        {filtered.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>
      {!filtered.length && (
        <p className="panel">No applications match your search.</p>
      )}
    </div>
  );
}
