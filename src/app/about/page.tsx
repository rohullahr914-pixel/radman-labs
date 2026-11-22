import { Explore } from "@/components/site";
export const metadata = {
  title: "About",
  description:
    "Meet Rohullah Radman and the independent software studio Radman Labs.",
};
export default function About() {
  return (
    <div className="wrap">
      <div className="page-head">
        <div className="eyebrow">Inside the studio</div>
        <h1>
          Independent thinking.
          <br />
          <em>Useful technology.</em>
        </h1>
      </div>
      <div className="content">
        <p>
          Radman Labs is an independent software and AI product studio. We build
          intelligent software, practical applications, and digital products
          that solve real-world problems.
        </p>
        <h2>Our mission</h2>
        <p>
          Making powerful technology accessible through thoughtfully engineered
          software.
        </p>
        <h2>Meet the founder</h2>
        <p>
          <strong className="text-white">
            Rohullah Radman — Founder & Software Engineer
          </strong>
          <br />
          <span lang="fa" dir="rtl">
            روح‌الله رادمان
          </span>
        </p>
        <p>
          From a first idea to a working application, Radman Labs approaches
          software with care, curiosity, and a focus on everyday usefulness.
        </p>
        <section>
          <h2>Engineering with intention</h2>
          <p>
            We start with a real need, build a focused solution, and improve it
            through use. Clear interfaces, dependable foundations and
            maintainable software guide the work.
          </p>
        </section>
        <section>
          <h2>Software and AI</h2>
          <p>
            Our focus spans practical applications, digital products and
            intelligent tools. We explore automation where it can simplify
            time-consuming work and keep the experience approachable.
          </p>
        </section>
        <section>
          <h2>From idea to everyday use</h2>
          <p>
            Understand the problem. Build and test the core experience. Release
            thoughtfully. Listen, refine and keep improving.
          </p>
        </section>
        <Explore />
      </div>
    </div>
  );
}
