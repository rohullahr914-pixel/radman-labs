import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { requireAdmin } from "@/lib/supabase";
import { MediaDelete } from "@/components/media-delete";
export default async function Media() {
  let db;
  try {
    db = await requireAdmin();
  } catch {
    redirect("/admin/login");
  }
  const { data, error } = await db.storage
    .from("product-images")
    .list("", { limit: 100, sortBy: { column: "created_at", order: "desc" } });
  return (
    <div className="wrap admin-shell">
      <div className="page-head">
        <h1 className="!text-4xl">Image library</h1>
        <p>
          Showing the 100 most recent images. Used images are protected from
          deletion.
        </p>
        <Link href="/admin" className="prose-link">
          Back to applications
        </Link>
      </div>
      {error && <p className="error-text">Unable to load images.</p>}
      <div className="three-grid">
        {data
          ?.filter((f) => f.name.endsWith(".webp"))
          .map((f) => (
            <div className="panel stack" key={f.name}>
              <Image
                src={
                  db.storage.from("product-images").getPublicUrl(f.name).data
                    .publicUrl
                }
                width={180}
                height={150}
                alt="Uploaded product media"
              />
              <MediaDelete name={f.name} />
            </div>
          ))}
      </div>
    </div>
  );
}
