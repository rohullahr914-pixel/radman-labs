"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteProduct } from "@/app/admin/actions";
import { Button } from "./ui/button";
export function DeleteApp({ id, name }: { id: string; name: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  return (
    <>
      <Button
        variant="ghost"
        disabled={busy}
        onClick={async () => {
          if (
            !confirm(
              `Delete ${name}? Its release history will also be removed.`,
            )
          )
            return;
          setBusy(true);
          try {
            const r = await deleteProduct(id);
            if (!r.ok) setError(r.error || "Unable to delete.");
            else router.refresh();
          } catch {
            setError("Unable to delete. Check your connection.");
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy ? "Deleting…" : "Delete"}
      </Button>
      {error && (
        <span role="alert" className="error-text">
          {error}
        </span>
      )}
    </>
  );
}
