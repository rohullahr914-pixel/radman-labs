import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Smartphone, Layers3 } from "lucide-react";
import { products } from "@/lib/products";
import { download } from "@/lib/download";
import { ProductCard, ProductIcon, SetupNotice } from "@/components/site";
import { Reveal } from "@/components/reveal";
export const dynamic = "force-dynamic";
export default async function Home() {
  const { items, mode } = await products();
  const featured = [...items]
    .sort((a, b) => Number(b.slug === "hesabko") - Number(a.slug === "hesabko"))
    .slice(0, 6);
  const lead = featured[0];
  const sources = await Promise.all(
    featured.map(async (p) => [p.slug, await download(p)] as const),
  );
  const downloads = new Map(sources);
  const categories = Array.from(new Set(items.map((p) => p.category)));
  const updated = [...items]
    .sort(
      (a, b) =>
        (Date.parse(b.updated_at) || 0) - (Date.parse(a.updated_at) || 0),
    )
    .slice(0, 4);
  return (
    <div className="wrap marketplace-home">
      <section className="market-hero">
        <Reveal>
          <div className="eyebrow">
            <span className="dot" />
            Independent software. Everyday possibilities.
          </div>
          <h1>
            Software built
            <br />
            for <em>real life.</em>
          </h1>
          <p>
            Discover powerful applications, intelligent tools, and thoughtfully
            engineered software from Radman Labs.
          </p>
          <div className="actions">
            <Link className="primary-link" href="/products">
              Explore Apps <ArrowUpRight size={18} />
            </Link>
            <Link className="secondary-link" href="/about">
              About Radman Labs
            </Link>
          </div>
          <div className="hero-footnote">
            <Smartphone size={16} /> Useful by design <span>·</span> Engineering
            Ideas Into Reality.
          </div>
        </Reveal>
        {lead ? (
          <Link className="hero-product" href={`/products/${lead.slug}`}>
            <div className="hero-product-art">
              {lead.cover_url ? (
                <Image
                  src={lead.cover_url}
                  alt={`${lead.name} featured cover`}
                  fill
                  priority
                  sizes="(max-width: 800px) 90vw, 45vw"
                />
              ) : lead.screenshots[0] ? (
                <Image
                  src={lead.screenshots[0]}
                  alt={`${lead.name} application screenshot`}
                  fill
                  priority
                  sizes="45vw"
                />
              ) : (
                <div className="honest-art">
                  <ProductIcon product={lead} />
                  <span>{lead.name}</span>
                  <small>{lead.tagline}</small>
                </div>
              )}
              <span className="editorial-label">IN THE SPOTLIGHT</span>
            </div>
            <div className="hero-product-caption">
              <div>
                <span className="card-category">
                  {lead.category} · {lead.platform}
                </span>
                <h2>{lead.name}</h2>
              </div>
              <ArrowUpRight />
            </div>
          </Link>
        ) : (
          <div className="hero-empty">
            <Layers3 size={48} />
            <h2>Your next useful tool.</h2>
            <p>
              Explore our software collection as new applications become
              available.
            </p>
            <Link href="/products">Browse the catalog ↗</Link>
          </div>
        )}
      </section>
      <SetupNotice mode={mode} />
      <section className="market-section">
        <div className="section-heading">
          <div>
            <div className="eyebrow">CURATED BY RADMAN LABS</div>
            <h2>Featured Apps</h2>
          </div>
          <Link href="/products">See all apps ↗</Link>
        </div>
        {featured.length ? (
          <div className="collection-rail">
            {featured.map((p) => (
              <ProductCard
                key={p.slug}
                product={p}
                downloadUrl={downloads.get(p.slug)?.url}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Layers3 />
            <h3>Good software takes care.</h3>
            <p>Our first published applications will appear here.</p>
          </div>
        )}
      </section>
      <section id="categories" className="market-section">
        <div className="section-heading">
          <div>
            <div className="eyebrow">FIND YOUR FOCUS</div>
            <h2>Explore by category</h2>
          </div>
        </div>
        <div className="category-grid">
          {categories.map((c) => (
            <Link key={c} href={`/products?category=${encodeURIComponent(c)}`}>
              <Layers3 />
              <strong>{c}</strong>
              <span>
                {items.filter((p) => p.category === c).length} apps{" "}
                <ArrowUpRight size={16} />
              </span>
            </Link>
          ))}
        </div>
        {!categories.length && (
          <p className="empty-inline">
            Categories appear when applications are published.
          </p>
        )}
      </section>
      {categories
        .filter(
          (c) =>
            items.length > 3 &&
            /business|productivity|\bai\b|automation/i.test(c),
        )
        .map((c) => (
          <section className="market-section" key={c}>
            <div className="section-heading">
              <h2>{c}</h2>
              <Link href={`/products?category=${encodeURIComponent(c)}`}>
                Explore category ↗
              </Link>
            </div>
            <div className="market-grid">
              {items
                .filter((p) => p.category === c)
                .slice(0, 4)
                .map((p) => (
                  <ProductCard key={p.slug} product={p} />
                ))}
            </div>
          </section>
        ))}
      <section className="market-section">
        <div className="section-heading">
          <h2>Recently Updated</h2>
          <Link href="/products?sort=updated">All Applications ↗</Link>
        </div>
        <div className="recent-list">
          {updated.map((p) => (
            <Link
              className="recent-app"
              href={`/products/${p.slug}`}
              key={p.slug}
            >
              <ProductIcon product={p} />
              <div>
                <h3>{p.name}</h3>
                <p>
                  {p.platform} · {p.pricing}
                  {p.updated_at
                    ? " · Updated " +
                      new Date(p.updated_at).toISOString().slice(0, 10)
                    : ""}
                </p>
              </div>
              <ArrowUpRight />
            </Link>
          ))}
        </div>
        {!updated.length && (
          <p className="empty-inline">
            New releases and updates will be listed here.
          </p>
        )}
      </section>
      <section className="studio-banner">
        <div>
          <div className="eyebrow">SMALL STUDIO. THOUGHTFUL SOFTWARE.</div>
          <h2>
            Powerful technology,
            <br />
            made approachable.
          </h2>
        </div>
        <div>
          <p>
            Making powerful technology accessible through thoughtfully
            engineered software.
          </p>
          <strong>Rohullah Radman — Founder & Software Engineer</strong>
          <p lang="fa">روح‌الله رادمان</p>
          <Link href="/about">Meet the studio ↗</Link>
        </div>
      </section>
    </div>
  );
}
