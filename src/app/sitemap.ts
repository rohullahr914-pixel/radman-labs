import type { MetadataRoute } from "next";
import { products } from "@/lib/products";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL || "https://radman-labs.vercel.app";
  return [
    "",
    "/products",
    "/about",
    "/contact",
    ...(await products()).items.map((p) => `/products/${p.slug}`),
  ].map((path) => ({ url: base + path }));
}
