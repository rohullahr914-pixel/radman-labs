"use client";
import { useState } from "react";
import { removeImage } from "@/app/admin/actions";
import { Button } from "./ui/button";
export function MediaDelete({ name }: { name: string }) {
  const [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  return (
    <div>
      <Button
        variant="outline"
        disabled={busy}
        onClick={async () => {
          if (!confirm("Permanently delete this unused image?")) return;
          setBusy(true);
          try {
            const result = await removeImage(name);
            setMessage(result.ok ? "Deleted." : result.error || "Failed.");
          } catch {
            setMessage("Deletion failed.");
          } finally {
            setBusy(false);
          }
        }}
      >
        Delete if unused
      </Button>
      <p role="status" className="text-xs">
        {message}
      </p>
    </div>
  );
}
