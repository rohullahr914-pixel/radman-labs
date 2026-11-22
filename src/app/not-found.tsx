import Link from "next/link";
export default function NotFound() {
  return (
    <div className="wrap page-head">
      <div className="eyebrow">404 / Not found</div>
      <h1>A little off course.</h1>
      <p>This page or published product could not be found.</p>
      <Link className="prose-link" href="/products">
        Explore products →
      </Link>
    </div>
  );
}
