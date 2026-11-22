import { redirect, notFound } from "next/navigation";
import { requireAdmin } from "@/lib/supabase";
import { Product } from "@/lib/types";
import { Editor } from "@/components/editor";
import { ReleaseEditor } from "@/components/release-editor";
export default async function Edit({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  let db;
  try {
    db = await requireAdmin();
  } catch {
    redirect("/admin/login");
  }
  const { id } = await params;
  let p: Product | undefined;
  if (id !== "new") {
    const { data, error } = await db
      .from("products")
      .select("*")
      .eq("id", id)
      .single();
    if (error || !data) notFound();
    p = data as Product;
  }
  const { data: history } = p
    ? await db
        .from("product_releases")
        .select("*")
        .eq("product_id", p.id)
        .order("published_at", { ascending: false })
    : { data: [] };
  return (
    <div className="wrap admin-shell">
      <div className="page-head">
        <div className="eyebrow">Application editor</div>
        <h1 className="!text-4xl">
          {p ? "Edit application" : "Add application"}
        </h1>
        <p>Fill in the details, upload images, and choose when to publish.</p>
      </div>
      <Editor product={p} />
      {p && <ReleaseEditor productId={p.id} items={history || []} />}
    </div>
  );
}
