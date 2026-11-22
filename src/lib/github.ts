import { z } from "zod";
export function repository(value: string) {
  const clean = value
    .trim()
    .replace(/^https:\/\/github\.com\//, "")
    .replace(/\/$/, "")
    .replace(/\.git$/, "");
  if (!/^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/.test(clean) || clean.includes(".."))
    throw new Error("Enter a GitHub owner/repository or repository URL.");
  return clean;
}
const assetSchema = z.object({
  name: z.string(),
  size: z.number().nonnegative(),
  browser_download_url: z.url(),
  state: z.string(),
});
const releaseSchema = z.object({
  tag_name: z.string(),
  name: z.string().nullable(),
  body: z.string().nullable(),
  published_at: z.string().nullable(),
  html_url: z.url(),
  draft: z.boolean(),
  prerelease: z.boolean(),
  assets: z.array(assetSchema),
});
export type Release = z.infer<typeof releaseSchema>;
export async function releases(repo: string): Promise<Release[]> {
  const normalized = repository(repo);
  const response = await fetch(
    `https://api.github.com/repos/${normalized}/releases?per_page=100`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        ...(process.env.GITHUB_TOKEN
          ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
          : {}),
      },
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(10000),
    },
  );
  if (!response.ok)
    throw new Error("GitHub releases are temporarily unavailable.");
  return z
    .array(releaseSchema)
    .parse(await response.json())
    .filter((r) => !r.draft && !r.prerelease)
    .map((r) => ({
      ...r,
      assets: r.assets.filter(
        (a) =>
          a.state === "uploaded" &&
          a.name.toLowerCase().endsWith(".apk") &&
          a.browser_download_url.startsWith(
            `https://github.com/${normalized}/releases/download/`,
          ),
      ),
    }));
}
export function selectAsset(items: Release[], tag: string, name: string) {
  const release = tag
    ? items.find((r) => r.tag_name === tag)
    : items.find((r) => r.assets.length);
  const asset = name
    ? release?.assets.find((a) => a.name === name)
    : release?.assets[0];
  return release && asset ? { release, asset } : null;
}
