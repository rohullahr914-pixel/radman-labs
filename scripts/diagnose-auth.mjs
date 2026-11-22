// Read-only diagnostics. No passwords, tokens or user data are printed.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
const key =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
let failures = 0;
function report(label, ok, detail = "") {
  console.log(
    `${ok ? "PASS" : "CHECK"} ${label}${detail ? `: ${detail}` : ""}`,
  );
  if (!ok) failures++;
}
async function request(path, token = key) {
  return fetch(`${url}${path}`, {
    headers: { apikey: token, Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(10000),
  });
}
report("Supabase URL", !!url);
report("Public API key", !!key && !key.startsWith("sb_secret_"));
report("Site origin", !!process.env.NEXT_PUBLIC_SITE_URL);
if (!url || !key || key.startsWith("sb_secret_")) {
  process.exitCode = 1;
} else {
  try {
    const settings = await request("/auth/v1/settings");
    report(
      "Auth endpoint and public key",
      settings.ok,
      `HTTP ${settings.status}`,
    );
    if (settings.ok) {
      const data = await settings.json();
      report("Email/password provider", data.external?.email === true);
      report("Public signups disabled", data.disable_signup === true);
    }
    const products = await request(
      "/rest/v1/products?select=id&status=eq.published&limit=1",
    );
    report(
      "Products table / public read policy",
      products.ok,
      `HTTP ${products.status}`,
    );
    const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (secret) {
      // Explicitly server-local optional key, never needed by the application.
      let owner;
      let exhausted = false;
      for (let page = 1; page <= 100; page++) {
        const r = await request(
          `/auth/v1/admin/users?page=${page}&per_page=100`,
          secret,
        );
        if (!r.ok) {
          report("Auth admin inspection", false, `HTTP ${r.status}`);
          break;
        }
        const data = await r.json();
        owner = data.users?.find(
          (u) => u.email?.toLowerCase() === "rohullahr914@gmail.com",
        );
        if (owner || !data.users?.length) {
          exhausted = true;
          break;
        }
      }
      report(
        "Owner Auth user exists",
        !!owner,
        exhausted ? "" : "User listing could not be completed",
      );
      if (owner) {
        report("Owner email confirmed", !!owner.email_confirmed_at);
        const r = await request(
          `/rest/v1/admin_profiles?select=id,role&id=eq.${encodeURIComponent(owner.id)}`,
          secret,
        );
        const rows = r.ok ? await r.json() : [];
        report(
          "Owner authorization record",
          rows.some((x) => x.role === "admin"),
        );
      }
    } else {
      console.log(
        "NOT TESTED Owner Auth user, confirmation and admin record: requires Supabase dashboard access or an optional server-local SUPABASE_SERVICE_ROLE_KEY. Never put it in a NEXT_PUBLIC variable or commit it.",
      );
    }
  } catch {
    report("Service connectivity", false, "Request failed or timed out.");
  }
  process.exitCode = failures ? 1 : 0;
}
console.log(
  "Manual: inspect Vercel Production env and redeploy after changes; verify Supabase Auth URL/email templates, invitation, recovery, cookies and admin RLS with the owner account. This tool never changes the database.",
);
