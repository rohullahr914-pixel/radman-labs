import { notFound } from "next/navigation";
import Image from "next/image";
import { product } from "@/lib/products";
import { configured, publicClient } from "@/lib/supabase";
import { releases, selectAsset } from "@/lib/github";
import { ProductIcon, SetupNotice } from "@/components/site";
import { Button } from "@/components/ui/button";
export const dynamic = "force-dynamic";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const p = await product((await params).slug);
  return {
    title: p?.name || "Product not found",
    description: p?.description,
    alternates: { canonical: `/products/${p?.slug || ""}` },
  };
}
export default async function Details({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const p = await product((await params).slug);
  if (!p) notFound();
  let selected: ReturnType<typeof selectAsset> = null;
  let failed = false;
  if (p.download_provider === "github") {
    try {
      selected = selectAsset(
        await releases(p.github_repository),
        p.github_tag,
        p.github_asset,
      );
    } catch {
      failed = true;
    }
  }
  const stored = configured()
    ? (
        await publicClient()
          .from("product_releases")
          .select("*")
          .eq("product_id", p.id)
          .order("published_at", { ascending: false })
      ).data
    : [];
  const url =
    p.download_provider === "github"
      ? selected?.asset.browser_download_url
      : p.download_url;
  const directRelease =
    p.download_provider === "direct"
      ? stored?.find(
          (r) => r.download_url === p.download_url && r.version === p.version,
        )
      : undefined;
  const fallback = `https://github.com/${p.github_repository}/releases`;
  return (
    <div className="wrap">
      {!configured() && <SetupNotice mode="preview" />}
      <div className="details-top">
        <ProductIcon product={p} />
        <div>
          <div className="eyebrow">
            {p.category} / {p.platform}
          </div>
          <h1>{p.name}</h1>
          <p lang={p.language.includes("Dari") ? "fa" : undefined}>
            {p.tagline}
          </p>
        </div>
      </div>
      <div className="details-layout">
        <div>
          {p.cover_url && (
            <Image
              className="cover"
              src={p.cover_url}
              alt={`${p.name} cover`}
              width={1000}
              height={400}
            />
          )}
          <h2>Made for everyday work.</h2>
          <p>{p.description}</p>
          {p.screenshots.length > 0 && (
            <>
              <h2>Inside the application</h2>
              <div className="screenshots">
                {p.screenshots.map((s, i) => (
                  <Image
                    key={s}
                    src={s}
                    width={280}
                    height={500}
                    alt={`${p.name} screenshot ${i + 1}`}
                  />
                ))}
              </div>
            </>
          )}
          <h2>Features</h2>
          <ul className="feature-list">
            {p.features.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
          <h2>Installation</h2>
          <p>
            {p.installation ||
              "Follow the download provider’s installation instructions."}
          </p>
          <h2>Changelog</h2>
          {selected ? (
            <>
              <p className="muted">
                GitHub release {selected.release.tag_name}
              </p>
              <pre className="notes">
                {selected.release.body || "No release notes provided."}
              </pre>
            </>
          ) : (
            <p>Release notes are unavailable.</p>
          )}
          {stored?.map((r) => (
            <div key={r.id}>
              <h3>{r.version}</h3>
              <pre className="notes">{r.release_notes}</pre>
            </div>
          ))}
          <h2>Developer</h2>
          <p>Rohullah Radman · Radman Labs</p>
          <a
            className="prose-link"
            href="https://github.com/rohullahr914-pixel"
          >
            Visit developer profile ↗
          </a>
        </div>
        <aside>
          <div className="panel">
            <div className="eyebrow">Ready when you are</div>
            <h3>
              {p.pricing} to {p.pricing === "Free" ? "download" : "explore"}
            </h3>
            <dl className="facts">
              {[
                ["Platform", p.platform],
                ["Language", p.language || "Not specified"],
                [
                  "Release",
                  selected?.release.tag_name ||
                    p.version ||
                    "See release source",
                ],
                ["APK", selected?.asset.name || "Not specified"],
                [
                  "File size",
                  selected
                    ? `${(selected.asset.size / 1024 / 1024).toFixed(1)} MB`
                    : directRelease?.file_size != null
                      ? `${(directRelease.file_size / 1024 / 1024).toFixed(1)} MB`
                      : "Not available",
                ],
                [
                  "Published",
                  selected?.release.published_at
                    ? new Date(selected.release.published_at)
                        .toISOString()
                        .slice(0, 10)
                    : directRelease?.published_at
                      ? new Date(directRelease.published_at)
                          .toISOString()
                          .slice(0, 10)
                      : "Not available",
                ],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
            {url && /^https:\/\//.test(url) ? (
              <Button asChild className="w-full">
                <a href={url} rel="noopener noreferrer">
                  Download {p.platform === "Android" ? "APK" : p.name} ↗
                </a>
              </Button>
            ) : (
              <p className="notice">
                {failed
                  ? "GitHub is temporarily unavailable."
                  : "A stable download is not available."}
              </p>
            )}
            {p.download_provider === "github" && (
              <a
                className="text-link mt-4"
                href={fallback}
                rel="noopener noreferrer"
              >
                Browse GitHub releases ↗
              </a>
            )}
            {selected && (
              <p className="mt-4 text-xs">
                Version is the GitHub release tag; the APK filename may differ.
                APK contents have not been independently audited.
              </p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
