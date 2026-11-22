import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/supabase";
import { Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { signOut } from "./actions";
import { ProductIcon } from "@/components/site";
import { DeleteApp } from "@/components/delete-app";
import { SaveToast } from "@/components/save-toast";
export const dynamic = "force-dynamic";
export default async function Admin() {
  let db;
  try {
    db = await requireAdmin();
  } catch {
    redirect("/admin/login");
  }
  const { data, error } = await db
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });
  const items = (data || []) as Product[];
  return (
    <div className="wrap admin-shell">
      <SaveToast />
      <div className="page-head section-heading">
        <div>
          <div className="eyebrow">Your studio</div>
          <h1 className="!text-4xl">Applications</h1>
        </div>
        <form action={signOut}>
          <Button variant="outline">Sign out</Button>
        </form>
      </div>
      {error && <p className="error-text">Unable to load applications.</p>}
      <div className="stats">
        {[
          ["Total", items.length],
          ["Published", items.filter((p) => p.status === "published").length],
          ["Drafts", items.filter((p) => p.status === "draft").length],
        ].map(([label, count]) => (
          <div className="panel" key={label}>
            <span className="muted">{label}</span>
            <strong>{count}</strong>
          </div>
        ))}
      </div>
      <Button asChild>
        <Link href="/admin/products/new">+ Add new application</Link>
      </Button>
      <p className="mt-4">
        <Link className="prose-link" href="/admin/media">
          Manage unused images
        </Link>
      </p>
      <div className="mt-8">
        {items.map((p) => (
          <div className="admin-row" key={p.id}>
            <div className="admin-row-meta">
              <ProductIcon product={p} />
              <div>
                <h3>{p.name}</h3>
                <p className="text-sm">
                  {p.status} · {p.platform} · {p.version || "No version"}
                </p>
              </div>
            </div>
            <div className="admin-row-actions">
              <Button variant="outline" asChild>
                <Link href={`/admin/products/${p.id}`}>Edit application</Link>
              </Button>
              <DeleteApp id={p.id} name={p.name} />
            </div>
          </div>
        ))}
        {!items.length && !error && (
          <p>No applications yet. Add your first application above.</p>
        )}
      </div>
      <p className="notice">
        Saved changes appear publicly immediately. GitHub release metadata
        refreshes within 5 minutes. Removed images stay in the media library
        until safely cleaned up.
      </p>
    </div>
  );
}
