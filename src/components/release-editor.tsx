"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveRelease, removeRelease } from "@/app/admin/actions";
import { Button } from "./ui/button";
type Release = {
  id: string;
  version: string;
  release_notes: string;
  download_url: string;
  file_size: number | null;
  published_at: string;
};
export function ReleaseEditor({
  productId,
  items,
}: {
  productId: string;
  items: Release[];
}) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  return (
    <section className="section stack">
      <h2 className="!text-2xl">Release history</h2>
      <p>
        Add or replace release notes by version. GitHub downloads always use
        live GitHub metadata.
      </p>
      {items.map((r) => (
        <div className="panel stack" key={r.id}>
          <h3>{r.version}</h3>
          <pre className="notes">{r.release_notes}</pre>
          <Button
            variant="ghost"
            className="justify-self-start"
            disabled={busy}
            onClick={async () => {
              if (!confirm(`Delete release ${r.version}?`)) return;
              setBusy(true);
              try {
                await removeRelease(r.id);
                router.refresh();
              } catch {
                setMessage("Could not delete release.");
              } finally {
                setBusy(false);
              }
            }}
          >
            Delete release
          </Button>
        </div>
      ))}
      <form
        className="form-grid panel"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          try {
            const f = new FormData(e.currentTarget);
            const result = await saveRelease(productId, {
              version: f.get("version"),
              release_notes: f.get("notes"),
              download_url: f.get("url"),
              file_size: f.get("size") ? Number(f.get("size")) : null,
              published_at: new Date(String(f.get("date"))).toISOString(),
            });
            setMessage(
              result.ok ? "Release saved." : result.error || "Save failed.",
            );
            if (result.ok) router.refresh();
          } catch {
            setMessage("Could not save release.");
          } finally {
            setBusy(false);
          }
        }}
      >
        <label>
          Version
          <input name="version" required maxLength={60} />
        </label>
        <label>
          File size in bytes (optional)
          <input name="size" type="number" min={0} />
        </label>
        <label>
          Published date
          <input name="date" type="datetime-local" required />
        </label>
        <label>
          HTTPS download URL
          <input name="url" type="url" required />
        </label>
        <label className="full">
          Release notes
          <textarea name="notes" maxLength={15000} />
        </label>
        <Button disabled={busy}>Save release</Button>
      </form>
      {message && <p role="status">{message}</p>}
    </section>
  );
}
