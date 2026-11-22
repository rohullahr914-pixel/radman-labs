import type { NextConfig } from "next";
const storage = process.env.NEXT_PUBLIC_SUPABASE_URL;
const nextConfig: NextConfig = {
  turbopack: { root: process.cwd() },
  images: {
    remotePatterns: storage
      ? [
          {
            protocol: new URL(storage).protocol === "http:" ? "http" : "https",
            port: new URL(storage).port,
            hostname: new URL(storage).hostname,
            pathname: "/storage/v1/object/public/product-images/**",
          },
        ]
      : [],
  },
  experimental: { serverActions: { bodySizeLimit: "1mb" } },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'",
          },
        ],
      },
    ];
  },
};
export default nextConfig;
