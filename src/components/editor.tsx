"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Product, initialProduct } from "@/lib/types";
import { saveProduct, deleteProduct, listGithub } from "@/app/admin/actions";
import { Button } from "./ui/button";
import { compressImage } from "@/lib/image-client";
type ReleaseList = Awaited<ReturnType<typeof listGithub>>;
export function Editor({ product }: { product?: Product }) {
  const [p, setP] = useState<Product>(
    product || {
      ...initialProduct,
      id: "",
      name: "",
      slug: "",
      tagline: "",
      description: "",
      features: [],
      version: "",
      github_repository: "",
      github_tag: "",
      github_asset: "",
      status: "draft",
    },
  );
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [items, setItems] = useState<ReleaseList>([]);
  const router = useRouter();
  const set = (key: keyof Product, value: unknown) =>
    setP((old) => ({ ...old, [key]: value }));
  async function upload(
    files: FileList | null,
    key: "icon_url" | "cover_url" | "screenshots",
  ) {
    if (!files?.length) return;
    if (key === "screenshots" && p.screenshots.length + files.length > 12) {
      setMessage("Use up to 12 screenshots per application.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const form = new FormData();
        form.set("file", await compressImage(file));
        const response = await fetch("/api/admin/upload", {
          method: "POST",
          body: form,
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        urls.push(data.url);
      }
      set(key, key === "screenshots" ? [...p.screenshots, ...urls] : urls[0]);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }
  async function save(status: Product["status"]) {
    setBusy(true);
    setMessage("");
    try {
      const result = await saveProduct(p.id, {
        ...p,
        status,
        features: p.features.map((f) => f.trim()).filter(Boolean),
      });
      if (result.ok) {
        router.push("/admin");
        router.refresh();
      } else setMessage(result.error || "Unable to save.");
    } catch {
      setMessage("Unable to save. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }
  const field = (
    key:
      | "name"
      | "slug"
      | "tagline"
      | "category"
      | "platform"
      | "version"
      | "language"
      | "download_url"
      | "github_repository"
      | "installation"
      | "description",
    label: string,
    multiline = false,
  ) => (
    <label key={key}>
      {label}
      {multiline ? (
        <textarea value={p[key]} onChange={(e) => set(key, e.target.value)} />
      ) : (
        <input value={p[key]} onChange={(e) => set(key, e.target.value)} />
      )}
    </label>
  );
  return (
    <form
      className="form-grid"
      onSubmit={(e) => {
        e.preventDefault();
        void save(p.status);
      }}
    >
      {field("name", "Application name")}
      {field("slug", "Page address (slug)")}
      {field("tagline", "Short description / tagline")}
      {field("category", "Category")}
      {field("platform", "Platform")}
      {field("version", "Version")}
      {field("language", "Language")}
      <label>
        Pricing
        <select
          value={p.pricing}
          onChange={(e) => set("pricing", e.target.value)}
        >
          <option>Free</option>
          <option>Paid</option>
        </select>
      </label>
      <div className="full">
        {field("description", "Full description", true)}
      </div>
      <div className="full">
        {field("installation", "Installation instructions", true)}
      </div>
      <label className="full">
        Features (one per line)
        <textarea
          value={p.features.join("\n")}
          onChange={(e) => set("features", e.target.value.split("\n"))}
        />
      </label>
      <section className="full panel stack">
        <h3>Images</h3>
        <p>
          JPEG, PNG or WebP · up to 8 MB each. Images are compressed on upload.
          Screenshots: up to 12.
        </p>
        {(["icon_url", "cover_url", "screenshots"] as const).map((key) => (
          <div className="stack" key={key}>
            <label>
              {key === "icon_url"
                ? "App icon"
                : key === "cover_url"
                  ? "Cover image"
                  : "Screenshots"}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                multiple={key === "screenshots"}
                disabled={busy}
                onChange={(e) => void upload(e.target.files, key)}
              />
            </label>
            <div className="preview-images">
              {(key === "screenshots" ? p.screenshots : [p[key]])
                .filter(Boolean)
                .map((url) => (
                  <div key={url}>
                    <Image
                      src={url}
                      width={150}
                      height={95}
                      alt="Uploaded image preview"
                    />
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        set(
                          key,
                          key === "screenshots"
                            ? p.screenshots.filter((s) => s !== url)
                            : "",
                        )
                      }
                    >
                      Remove from application
                    </button>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </section>
      <section className="full panel stack">
        <h3>Download source</h3>
        <label>
          Provider
          <select
            value={p.download_provider}
            onChange={(e) => set("download_provider", e.target.value)}
          >
            <option value="github">GitHub Releases</option>
            <option value="direct">Direct HTTPS URL</option>
          </select>
        </label>
        {p.download_provider === "direct" ? (
          field("download_url", "HTTPS download URL")
        ) : (
          <>
            {field(
              "github_repository",
              "GitHub repository URL or owner/repository",
            )}
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                setMessage("");
                try {
                  setItems(await listGithub(p.github_repository));
                } catch (e) {
                  setMessage(
                    e instanceof Error ? e.message : "Could not load releases.",
                  );
                } finally {
                  setBusy(false);
                }
              }}
            >
              Load stable releases
            </Button>
            <label>
              Release
              <select
                value={p.github_tag}
                onChange={(e) => {
                  set("github_tag", e.target.value);
                  set("github_asset", "");
                }}
              >
                <option value="">Latest stable release with APK</option>
                {p.github_tag &&
                  !items.some((r) => r.tag_name === p.github_tag) && (
                    <option value={p.github_tag}>{p.github_tag} (saved)</option>
                  )}
                {items.map((r) => (
                  <option key={r.tag_name}>{r.tag_name}</option>
                ))}
              </select>
            </label>
            <label>
              APK asset
              <select
                value={p.github_asset}
                onChange={(e) => set("github_asset", e.target.value)}
              >
                <option value="">First APK in release</option>
                {p.github_asset && (
                  <option value={p.github_asset}>{p.github_asset}</option>
                )}
                {(
                  items.find((r) => r.tag_name === p.github_tag) ||
                  (!p.github_tag
                    ? items.find((r) => r.assets.length)
                    : undefined)
                )?.assets
                  .filter((a) => a.name !== p.github_asset)
                  .map((a) => (
                    <option key={a.name}>{a.name}</option>
                  ))}
              </select>
            </label>
            <p>
              Only stable, published APK assets are offered. Version and file
              size on the product page come from GitHub.
            </p>
          </>
        )}
      </section>
      <div className="full stack">
        {message && (
          <p className="error-text" role="alert">
            {message}
          </p>
        )}
        <div className="actions">
          <Button
            type="button"
            disabled={busy}
            onClick={() => void save("published")}
          >
            {busy ? "Working…" : "Publish application"}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={() => void save("draft")}
          >
            Save as draft / Unpublish
          </Button>
          <Link href="/admin">Cancel</Link>
        </div>
        {p.id && (
          <Button
            type="button"
            className="justify-self-start text-rose-300"
            variant="ghost"
            disabled={busy}
            onClick={async () => {
              if (
                !confirm(
                  `Delete ${p.name}? This permanently removes the application and its release records.`,
                )
              )
                return;
              setBusy(true);
              const result = await deleteProduct(p.id);
              if (result.ok) {
                router.push("/admin");
                router.refresh();
              } else {
                setMessage(result.error || "Delete failed.");
                setBusy(false);
              }
            }}
          >
            Delete application
          </Button>
        )}
      </div>
    </form>
  );
}
