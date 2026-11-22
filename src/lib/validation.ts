import { z } from "zod";
const text = (max: number) => z.string().trim().max(max);
export const httpsUrl = z.string().refine((value) => {
  if (!value) return true;
  try {
    const u = new URL(value);
    return u.protocol === "https:" && !u.username && !u.password;
  } catch {
    return false;
  }
}, "Use an HTTPS URL without credentials.");
export const productSchema = z
  .object({
    name: text(160).min(1),
    slug: z
      .string()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .max(100),
    tagline: text(300),
    description: text(10000).min(1),
    category: text(100).min(1),
    platform: text(60).min(1),
    version: text(60),
    pricing: z.enum(["Free", "Paid"]),
    icon_url: httpsUrl,
    cover_url: httpsUrl,
    screenshots: z.array(httpsUrl).max(12),
    features: z.array(text(300).min(1)).max(40),
    features_confirmed: z.boolean().default(false),
    release_notes: text(15000).default(""),
    download_provider: z.enum(["github", "direct"]),
    download_url: httpsUrl,
    github_repository: text(200),
    github_tag: text(150),
    github_asset: text(200),
    status: z.enum(["draft", "published"]),
    installation: text(5000),
    language: text(100),
  })
  .superRefine((p, ctx) => {
    if (
      p.status === "published" &&
      p.download_provider === "direct" &&
      !p.download_url
    )
      ctx.addIssue({
        code: "custom",
        path: ["download_url"],
        message: "A published product needs a download URL.",
      });
  });
