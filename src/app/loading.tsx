export default function Loading() {
  return (
    <div className="wrap py-10" role="status">
      <span className="sr-only">Loading applications…</span>
      <div className="skeleton-grid" aria-hidden="true">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div className="skeleton-card" key={i} />
        ))}
      </div>
    </div>
  );
}
