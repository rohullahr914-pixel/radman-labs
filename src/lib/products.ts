import "server-only";
import { configured, publicClient } from "./supabase";
import { Product, initialProduct } from "./types";
export async function products(): Promise<{
  items: Product[];
  mode: "live" | "preview" | "error";
}> {
  if (!configured()) return { items: [initialProduct], mode: "preview" };
  const { data, error } = await publicClient()
    .from("products")
    .select("*")
    .eq("status", "published")
    .order("created_at", { ascending: false });
  return { items: (data ?? []) as Product[], mode: error ? "error" : "live" };
}
export async function product(slug: string) {
  return (await products()).items.find((p) => p.slug === slug);
}
