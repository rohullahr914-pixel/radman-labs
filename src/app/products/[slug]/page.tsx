import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Download, ArrowLeft, ShieldCheck } from "lucide-react";
import { product, products } from "@/lib/products";
import { configured, publicClient } from "@/lib/supabase";
import { download } from "@/lib/download";
import { Gallery } from "@/components/gallery";
import { ProductIcon, ProductCard, SetupNotice } from "@/components/site";
export const dynamic = "force-dynamic";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const p = await product((await params).slug);
  return {
    title: p?.name || "App not found",
    description: p?.description,
    alternates: { canonical: `/products/${p?.slug || ""}` },
  };
}
const date = (value: string) =>
  value
    ? new Date(value).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      })
    : "Not provided";
export default async function Details({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const p = await product((await params).slug);
  if (!p) notFound();
  const [{ url, selected, fallback }, catalog] = await Promise.all([
    download(p),
    products(),
  ]);
  const { data: history } = configured()
    ? await publicClient()
        .from("product_releases")
        .select("*")
        .eq("product_id", p.id)
        .lte("published_at", new Date().toISOString())
        .order("published_at", { ascending: false })
    : { data: [] };
  const related = catalog.items
    .filter((x) => x.slug !== p.slug && x.category === p.category)
    .slice(0, 4);
  const direct = history?.find(
    (r) => r.download_url === p.download_url && r.version === p.version,
  );
  const size = selected?.asset.size ?? direct?.file_size;
  const published =
    selected?.release.published_at || direct?.published_at || p.updated_at;
  return (
    <div className="wrap storefront">
      <Link className="back-link" href="/products">
        <ArrowLeft size={16} /> All applications
      </Link>
      {!configured() && <SetupNotice mode="preview" />}
      <section className="storefront-heading">
        <ProductIcon product={p} />
        <div>
          <span className="card-category">
            {p.category} · {p.platform}
          </span>
          <h1>{p.name}</h1>
          <p
            className="app-tagline"
            lang={p.language.includes("Dari") ? "fa" : undefined}
          >
            {p.tagline}
          </p>
          <Link href="/about" className="developer-link">
            Radman Labs · Rohullah Radman
          </Link>
        </div>
        <div className="storefront-download">
          <span className="pill">{p.pricing}</span>
          {url ? (
            <a className="primary-link" href={url}>
              <Download size={19} /> Download{" "}
              {p.platform === "Android" ? "APK" : "app"}
            </a>
          ) : (
            <span className="unavailable">Download unavailable</span>
          )}
          <small>
            {size != null ? `${(size / 1048576).toFixed(1)} MB · ` : ""}
            {p.platform}
          </small>
        </div>
      </section>
      <div className="app-fact-strip">
        {[
          ["Platform", p.platform],
          ["Pricing", p.pricing],
          [
            "Release",
            selected?.release.tag_name || p.version || "Not provided",
          ],
          [
            "File size",
            size != null ? `${(size / 1048576).toFixed(1)} MB` : "Not provided",
          ],
          ["Updated", date(published)],
          ["Language", p.language || "Not provided"],
        ].map(([k, v]) => (
          <div key={k}>
            <span>{k}</span>
            <strong>{v}</strong>
          </div>
        ))}
      </div>
      {p.cover_url && (
        <Image
          className="storefront-cover"
          src={p.cover_url}
          alt={`${p.name} cover`}
          width={1200}
          height={450}
          sizes="90vw"
          priority
        />
      )}
      <section className="market-section">
        <div className="section-heading">
          <h2>A closer look</h2>
          <span className="muted">
            {p.screenshots.length
              ? `${p.screenshots.length} screenshots`
              : "Inside the app"}
          </span>
        </div>
        <Gallery images={p.screenshots} name={p.name} />
      </section>
      <nav className="detail-tabs" aria-label="App information">
        <a href="#about-app">About</a>
        <a href="#whats-new">What’s new</a>
        <a href="#technical">App information</a>
        <a href="#install">Installation</a>
      </nav>
      <div className="storefront-body">
        <div>
          <section id="about-app" className="app-section">
            <h2>About this app</h2>
            <p className="preserve-lines">{p.description}</p>
            {p.features.length > 0 && (
              <>
                <h3>Key features</h3>
                <ul className="feature-list">
                  {p.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </>
            )}
          </section>
          <section id="whats-new" className="app-section">
            <h2>What’s New</h2>
            {selected ? (
              <>
                <span className="pill">
                  GitHub release {selected.release.tag_name}
                </span>
                <pre className="notes">
                  {selected.release.body ||
                    "The developer has not supplied release notes."}
                </pre>
              </>
            ) : (
              <pre className="notes">
                {p.release_notes ||
                  history?.[0]?.release_notes ||
                  "Release notes have not been provided."}
              </pre>
            )}
          </section>
          {p.features_confirmed && p.features.length > 0 && (
            <section>
              <h2>Key features</h2>
              <ul className="feature-list">
                {p.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </section>
          )}
          <section id="install" className="app-section">
            <h2>Installation instructions</h2>
            <p className="preserve-lines">
              {p.installation ||
                (p.platform === "Android"
                  ? "Download the APK on your Android device. Open it and allow installation from your browser if Android asks. Install the app, then turn that permission off."
                  : "Follow the download provider’s installation instructions.")}
            </p>
          </section>
          <section className="app-section">
            <h2>Version history</h2>
            {history?.length ? (
              history.map((r) => (
                <details className="version-entry" key={r.id}>
                  <summary>
                    {r.version}
                    <span>{date(r.published_at)}</span>
                  </summary>
                  <pre className="notes">
                    {r.release_notes || "No release notes provided."}
                  </pre>
                  <a className="text-link" href={r.download_url}>
                    Download this version ↗
                  </a>
                </details>
              ))
            ) : (
              <p>
                {selected
                  ? `Current GitHub release: ${selected.release.tag_name}. Earlier versions have not been added.`
                  : "No version history has been added."}
              </p>
            )}
          </section>
        </div>
        <aside>
          <section id="technical" className="panel technical-card">
            <h2>Download information</h2>
            <dl className="facts">
              {[
                ["Developer", "Radman Labs"],
                [
                  "Source",
                  p.download_provider === "github"
                    ? "GitHub Releases"
                    : url
                      ? new URL(url).hostname
                      : "Direct HTTPS",
                ],
                ["Release tag", selected?.release.tag_name || "Not applicable"],
                ["App version", p.version || "Not provided"],
                ["Filename", selected?.asset.name || "Not provided"],
                [
                  "Size",
                  size != null
                    ? `${size.toLocaleString("en-US")} bytes`
                    : "Not provided",
                ],
                ["Published", date(published)],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
            {selected && (
              <p className="small-note">
                Release tag and asset filename come from GitHub. The tag does
                not establish the APK’s internal version.
              </p>
            )}
            {!url && (
              <p className="notice">
                The selected stable release could not be resolved. Please try
                again later.
              </p>
            )}
            {fallback && (
              <a className="text-link" href={fallback}>
                Browse GitHub releases ↗
              </a>
            )}
          </section>
          <section className="panel developer-card">
            <ShieldCheck />
            <h3>Built by Radman Labs</h3>
            <p>Thoughtfully engineered software by Rohullah Radman.</p>
            <Link href="/about">Meet the developer ↗</Link>
          </section>
        </aside>
      </div>
      {related.length > 0 && (
        <section className="market-section">
          <div className="section-heading">
            <h2>More to explore</h2>
          </div>
          <div className="market-grid">
            {related.map((x) => (
              <ProductCard key={x.slug} product={x} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
