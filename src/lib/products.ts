import "server-only";
import { cache } from "react";
import { configured, publicClient } from "./supabase";
import { Product, initialProduct } from "./types";
export const products = cache(async function products(): Promise<{
  items: Product[];
  mode: "live" | "preview" | "error" | "unconfigured";
}> {
  if (!configured())
    return process.env.CATALOG_PREVIEW === "true" &&
      process.env.VERCEL_ENV !== "production"
      ? { items: [initialProduct], mode: "preview" }
      : { items: [], mode: "unconfigured" };
  const { data, error } = await publicClient()
    .from("products")
    .select("*")
    .eq("status", "published")
    .order("updated_at", { ascending: false });
  return { items: (data ?? []) as Product[], mode: error ? "error" : "live" };
});
export const product = cache(async function product(slug: string) {
  if (!configured())
    return (await products()).items.find((p) => p.slug === slug);
  const { data } = await publicClient()
    .from("products")
    .select("*")
    .eq("status", "published")
    .eq("slug", slug)
    .maybeSingle();
  return data as Product | null;
});
