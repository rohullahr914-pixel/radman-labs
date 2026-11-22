"use client";
export function DirectSource({ url }: { url: string }) {
  let hostname = "";
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "https:" && !parsed.username && !parsed.password)
      hostname = parsed.hostname;
  } catch {
    /* Validation feedback is rendered below. */
  }
  if (!url)
    return (
      <p className="small-note">
        Enter the full HTTPS file URL from your download host.
      </p>
    );
  if (!hostname)
    return (
      <p className="error-text" role="status">
        Use a valid HTTPS URL without a username or password.
      </p>
    );
  return (
    <p className="small-note">
      Configured source: <strong>{hostname}</strong>. This URL is supplied by
      you; file size and availability are not automatically verified.
    </p>
  );
}
