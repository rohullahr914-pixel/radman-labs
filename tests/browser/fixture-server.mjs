// Isolated HTTP fixtures for browser tests. Never imported by the application.
import { createServer } from "node:http";
const app = {
  id: "00000000-0000-4000-8000-000000000001",
  name: "HesabKo — حساب کو",
  slug: "hesabko",
  tagline: "حساب آسان، کاروبار مطمئن",
  description:
    "Offline accounting and inventory management for small shops and businesses in Afghanistan.",
  category: "Business Software",
  platform: "Android",
  version: "Owner-entered version",
  pricing: "Free",
  icon_url: "",
  cover_url: "",
  screenshots: ["/icon.svg?test=1", "/icon.svg?test=2"],
  features: [],
  features_confirmed: false,
  release_notes: "Browser test fixture only.",
  download_provider: "github",
  download_url: "",
  github_repository: "rohullahr914-pixel/HesabKo-Android",
  github_tag: "v1.0.0",
  github_asset: "HesabKo-v1.4-release.9.apk",
  status: "published",
  installation:
    "Download the APK, open it on Android, and follow the device prompts.",
  language: "Dari / Persian",
  created_at: "2026-11-21T00:00:00Z",
  updated_at: "2026-11-21T00:00:00Z",
};
createServer((req, res) => {
  res.setHeader("Content-Type", "application/json");
  if (req.url === "/health") {
    res.end("{}");
    return;
  }
  if (req.method === "GET" && req.url?.startsWith("/rest/v1/products")) {
    res.end(JSON.stringify([app]));
    return;
  }
  if (
    req.method === "GET" &&
    req.url?.startsWith("/rest/v1/product_releases")
  ) {
    res.end("[]");
    return;
  }
  res.statusCode = 401;
  res.end(JSON.stringify({ error: "Unauthorized fixture request" }));
}).listen(54329, "127.0.0.1");
