import { test } from "node:test";
import assert from "node:assert/strict";
import { repository, releases, selectAsset } from "../src/lib/github";
import { productSchema, httpsUrl } from "../src/lib/validation";
import { initialProduct } from "../src/lib/types";
test("repository rejects arbitrary hosts, path traversal and query injection", () => {
  assert.equal(repository("https://github.com/owner/app.git"), "owner/app");
  for (const input of [
    "https://evil.test/a/b",
    "owner/../private",
    "owner/repo?x=y",
    "owner/repo/releases",
    "owner/..",
  ])
    assert.throws(() => repository(input));
});
test("only stable uploaded APKs from the expected repository are offered", async () => {
  const original = global.fetch;
  const asset = (name: string, url: string, state = "uploaded") => ({
    name,
    browser_download_url: url,
    size: 100,
    state,
  });
  const stable = {
    tag_name: "v1",
    name: null,
    body: null,
    published_at: null,
    html_url: "https://github.com/o/r/releases/tag/v1",
    draft: false,
    prerelease: false,
    assets: [
      asset("app.apk", "https://github.com/o/r/releases/download/v1/app.apk"),
      asset("bad.apk", "https://evil.test/app.apk"),
      asset(
        "source.zip",
        "https://github.com/o/r/releases/download/v1/source.zip",
      ),
      asset(
        "incomplete.apk",
        "https://github.com/o/r/releases/download/v1/incomplete.apk",
        "new",
      ),
    ],
  };
  global.fetch = async () =>
    new Response(
      JSON.stringify([
        stable,
        { ...stable, draft: true },
        { ...stable, prerelease: true },
      ]),
    );
  try {
    const items = await releases("o/r");
    assert.equal(items.length, 1);
    assert.equal(items[0].assets.length, 1);
    assert.equal(selectAsset(items, "v1", "app.apk")?.asset.size, 100);
    assert.equal(selectAsset(items, "v9", "app.apk"), null);
    assert.equal(selectAsset(items, "v1", "missing.apk"), null);
  } finally {
    global.fetch = original;
  }
});
test("GitHub API failures do not produce a fabricated link", async () => {
  const original = global.fetch;
  global.fetch = async () => new Response("", { status: 503 });
  try {
    await assert.rejects(() => releases("o/r"));
  } finally {
    global.fetch = original;
  }
});
test("privileged product input rejects unsafe links, invalid slugs and oversized media lists", () => {
  assert.equal(productSchema.safeParse(initialProduct).success, true);
  for (const url of [
    "javascript:alert(1)",
    "http://example.com/app.apk",
    "https://user:secret@example.com/a",
  ])
    assert.equal(httpsUrl.safeParse(url).success, false);
  assert.equal(
    productSchema.safeParse({ ...initialProduct, slug: "../admin" }).success,
    false,
  );
  assert.equal(
    productSchema.safeParse({
      ...initialProduct,
      screenshots: Array(13).fill("https://example.com/image.webp"),
    }).success,
    false,
  );
  assert.equal(
    productSchema.safeParse({
      ...initialProduct,
      download_provider: "direct",
      download_url: "",
    }).success,
    false,
  );
});
