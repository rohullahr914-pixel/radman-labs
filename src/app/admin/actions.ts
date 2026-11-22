"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin, sessionClient } from "@/lib/supabase";
import { productSchema } from "@/lib/validation";
import { repository, releases, selectAsset } from "@/lib/github";
import { z } from "zod";
import { httpsUrl } from "@/lib/validation";
export async function saveProduct(id: string, raw: unknown) {
  try {
    const db = await requireAdmin();
    const data = productSchema.parse(raw);
    if (
      data.download_provider === "github" &&
      (data.github_repository || data.status === "published")
    ) {
      data.github_repository = repository(data.github_repository);
      if (
        data.status === "published" &&
        !selectAsset(
          await releases(data.github_repository),
          data.github_tag,
          data.github_asset,
        )
      )
        throw new Error(
          "Select an available stable APK release before publishing.",
        );
    }
    const media = [data.icon_url, data.cover_url, ...data.screenshots].filter(
      Boolean,
    );
    const prefix = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/`;
    if (media.some((url) => !url.startsWith(prefix)))
      throw new Error("Use images uploaded to your product storage bucket.");
    const result = id
      ? await db
          .from("products")
          .update(data)
          .eq("id", id)
          .select("id")
          .single()
      : await db.from("products").insert(data).select("id").single();
    if (result.error)
      throw new Error(
        ["PGRST204", "42703"].includes(result.error.code)
          ? "Database upgrade required: apply supabase/migrations/202611210004_marketplace.sql in the existing Supabase project before saving."
          : result.error.message,
      );
    revalidatePath("/", "layout");
    return { ok: true, id: result.data.id };
  } catch (e) {
    return {
      ok: false,
      error:
        e instanceof z.ZodError
          ? `${e.issues[0].path.join(" ")}: ${e.issues[0].message}`
          : e instanceof Error
            ? e.message
            : "Unable to save application.",
    };
  }
}
export async function deleteProduct(id: string) {
  try {
    const db = await requireAdmin();
    const { error } = await db.from("products").delete().eq("id", id);
    if (error) throw error;
    revalidatePath("/", "layout");
    return { ok: true };
  } catch {
    return { ok: false, error: "Unable to delete application." };
  }
}
export async function listGithub(value: string) {
  await requireAdmin();
  return releases(repository(value));
}
export async function saveRelease(productId: string, raw: unknown) {
  try {
    const db = await requireAdmin();
    const data = z
      .object({
        version: z.string().trim().min(1).max(60),
        release_notes: z.string().max(15000),
        download_url: httpsUrl.refine(Boolean, "Download URL is required."),
        file_size: z.number().int().nonnegative().nullable(),
        published_at: z.iso.datetime(),
      })
      .parse(raw);
    const { error } = await db
      .from("product_releases")
      .upsert(
        { ...data, product_id: productId },
        { onConflict: "product_id,version" },
      );
    if (error) throw error;
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Unable to save release.",
    };
  }
}
export async function removeRelease(id: string) {
  const db = await requireAdmin();
  const { error } = await db.from("product_releases").delete().eq("id", id);
  if (error) throw new Error("Unable to delete release.");
  revalidatePath("/", "layout");
}
export async function removeImage(name: string) {
  const db = await requireAdmin();
  if (!/^[a-f0-9-]+\.webp$/.test(name))
    return { ok: false, error: "Invalid image path." };
  const url = db.storage.from("product-images").getPublicUrl(name)
    .data.publicUrl;
  const { data, error } = await db
    .from("products")
    .select("icon_url,cover_url,screenshots");
  if (error) return { ok: false, error: "Unable to verify image usage." };
  if (
    data.some(
      (p) =>
        p.icon_url === url ||
        p.cover_url === url ||
        p.screenshots.includes(url),
    )
  )
    return {
      ok: false,
      error:
        "This image is still used by an application. Remove it and save first.",
    };
  const result = await db.storage.from("product-images").remove([name]);
  if (result.error) return { ok: false, error: result.error.message };
  revalidatePath("/admin/media");
  return { ok: true };
}
export async function signOut() {
  const db = await sessionClient();
  await db.auth.signOut();
  redirect("/admin/login");
}
