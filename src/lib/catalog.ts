import type { Product } from "./types";
export type Filters = {
  q: string;
  category: string;
  platform: string;
  pricing: string;
  sort: string;
};
export function filterProducts(items: Product[], filters: Filters) {
  const q = filters.q.trim().toLocaleLowerCase();
  return items
    .filter(
      (p) =>
        (!q ||
          `${p.name} ${p.tagline} ${p.description}`
            .toLocaleLowerCase()
            .includes(q)) &&
        (!filters.category || p.category === filters.category) &&
        (!filters.platform || p.platform === filters.platform) &&
        (!filters.pricing || p.pricing === filters.pricing),
    )
    .sort((a, b) =>
      filters.sort === "name"
        ? a.name.localeCompare(b.name)
        : (Date.parse(b.updated_at) || 0) - (Date.parse(a.updated_at) || 0),
    );
}
