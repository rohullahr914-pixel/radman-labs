import Link from "next/link";
import { ArrowUpRight, Smartphone, Code2, Sparkles } from "lucide-react";
import { products } from "@/lib/products";
import {
  ContactCards,
  Explore,
  ProductCard,
  SetupNotice,
} from "@/components/site";
import { Reveal } from "@/components/reveal";
export const dynamic = "force-dynamic";
export default async function Home() {
  const { items, mode } = await products();
  return (
    <>
      <section className="hero wrap">
        <Reveal>
          <div className="eyebrow">
            <span className="dot" /> Independent software & AI studio
          </div>
          <h1>
            Engineering ideas
            <br />
            into <em>reality.</em>
          </h1>
          <p className="hero-copy">
            Building intelligent software, practical applications, and digital
            products that solve real-world problems.
          </p>
          <div className="actions">
            <Explore />
            <Link className="text-link" href="/about">
              Meet Radman Labs <ArrowUpRight size={16} />
            </Link>
          </div>
        </Reveal>
        <div className="hero-art" aria-hidden="true">
          <div className="orbit" />
          <svg viewBox="0 0 320 320">
            <path
              d="M76 246V74h114l67 69h-84l84 103h-76l-72-103h77l-34-35h-43v138Z"
              fill="#10b98112"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
          <span className="art-caption">RADMAN LABS / IDEAS IN MOTION</span>
        </div>
      </section>
      <div className="discipline">
        <div className="wrap">
          THOUGHTFULLY ENGINEERED <span>Software</span>
          <span>AI & automation</span>
          <span>Everyday tools</span>
        </div>
      </div>
      <section className="wrap section">
        <div className="section-heading">
          <div>
            <div className="eyebrow">01 / Our products</div>
            <h2>Built for the real world.</h2>
          </div>
          <Link className="text-link" href="/products">
            All products <ArrowUpRight size={18} />
          </Link>
        </div>
        <SetupNotice mode={mode} />
        <div className="product-grid">
          {items.slice(0, 3).map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
          <div className="next-card">
            <span className="eyebrow">THE NEXT CHAPTER</span>
            <h3>
              Good ideas
              <br />
              keep moving.
            </h3>
            <p>
              We’re exploring what technology can make simpler, smarter, and
              more useful.
            </p>
            <Link href="/about">
              Inside the studio <ArrowUpRight size={18} />
            </Link>
          </div>
        </div>
      </section>
      <section className="wrap section">
        <div className="section-heading">
          <div>
            <div className="eyebrow">02 / What we build</div>
            <h2>Purpose before complexity.</h2>
          </div>
          <p>
            Independent by design.
            <br />
            Practical by nature.
          </p>
        </div>
        <div className="three-grid">
          <div className="service">
            <Smartphone />
            <h3>Practical applications</h3>
            <p>Accessible tools designed around everyday needs.</p>
          </div>
          <div className="service">
            <Sparkles />
            <h3>Intelligent software</h3>
            <p>Exploring AI that makes time-consuming tasks simpler.</p>
          </div>
          <div className="service">
            <Code2 />
            <h3>Digital products</h3>
            <p>Reliable software, thoughtfully built from the first idea.</p>
          </div>
        </div>
        <div className="categories">
          {["Business Software", "AI & Automation", "Utilities"].map((c) => (
            <Link key={c} href={`/products?category=${encodeURIComponent(c)}`}>
              {c} ↗
            </Link>
          ))}
        </div>
      </section>
      <section className="wrap founder section">
        <div>
          <div className="eyebrow">03 / The person behind the work</div>
          <h2>
            Small studio.
            <br />
            Personal commitment.
          </h2>
        </div>
        <div>
          <p>
            Radman Labs is an independent software and AI product studio founded
            by Rohullah Radman. We believe powerful technology should feel
            approachable.
          </p>
          <h3>Rohullah Radman</h3>
          <p lang="fa" dir="rtl" className="persian">
            روح‌الله رادمان
          </p>
          <span className="muted">Founder & Software Engineer</span>
        </div>
      </section>
      <section className="wrap section">
        <div className="eyebrow">04 / Let’s connect</div>
        <h2>
          Every useful product
          <br />
          starts with a conversation.
        </h2>
        <ContactCards />
      </section>
    </>
  );
}
