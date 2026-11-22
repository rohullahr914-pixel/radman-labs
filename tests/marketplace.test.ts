import { test } from "node:test";
import assert from "node:assert/strict";
import { filterProducts } from "../src/lib/catalog";
import { initialProduct } from "../src/lib/types";
import { authMessage } from "../src/lib/auth-errors";
import { supabaseConfig } from "../src/lib/supabase-config";
test("catalog combines search, category, platform, pricing and sorting without mutation", () => {
  const rows = [
    { ...initialProduct, id: "1", name: "Beta", updated_at: "2026-01-01" },
    {
      ...initialProduct,
      id: "2",
      name: "Alpha",
      pricing: "Paid" as const,
      platform: "Web",
      updated_at: "2026-02-01",
    },
  ];
  const f = { q: "", category: "", platform: "", pricing: "", sort: "updated" };
  assert.equal(filterProducts(rows, f)[0].id, "2");
  assert.equal(
    filterProducts(rows, {
      ...f,
      pricing: "Free",
      platform: "Android",
      category: "Business Software",
      q: "beta",
    })[0].id,
    "1",
  );
  assert.equal(filterProducts(rows, { ...f, q: "missing" }).length, 0);
  assert.equal(filterProducts(rows, { ...f, sort: "name" })[0].name, "Alpha");
  assert.equal(rows[0].name, "Beta");
});
test("safe auth messages distinguish recovery from configuration and rate limits", () => {
  assert.match(authMessage("invalid_credentials", 400), /reset your password/);
  assert.match(authMessage("email_not_confirmed"), /Confirm/);
  assert.match(authMessage(undefined, 429), /wait/);
  assert.match(authMessage("email_provider_disabled"), /Email provider/);
});
test("legacy anon key is accepted while secret keys and invalid origins are rejected", () => {
  const keys = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  ] as const;
  const saved = keys.map((k) => process.env[k]);
  try {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co/";
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "legacy-public-key";
    assert.equal(supabaseConfig()?.url, "https://example.supabase.co");
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "sb_secret_invalid";
    assert.equal(supabaseConfig(), null);
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_test";
    process.env.NEXT_PUBLIC_SUPABASE_URL = "http://remote.example";
    assert.equal(supabaseConfig(), null);
  } finally {
    keys.forEach((k, i) => {
      if (saved[i] === undefined) delete process.env[k];
      else process.env[k] = saved[i];
    });
  }
});
