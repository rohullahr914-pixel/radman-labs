import { ImageResponse } from "next/og";
import { product } from "@/lib/products";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "A Radman Labs application";
export default async function ProductOG({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const p = await product((await params).slug);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: "#080c14",
          color: "white",
        }}
      >
        <div style={{ fontSize: 28, color: "#34d399", display: "flex" }}>
          RADMAN LABS / {p?.platform || "SOFTWARE"}
        </div>
        <div style={{ fontSize: 72 }}>{p?.name || "Radman Labs"}</div>
        <div style={{ fontSize: 28, color: "#9da8b9" }}>
          {p?.description.slice(0, 160) || "Engineering Ideas Into Reality."}
        </div>
      </div>
    ),
    size,
  );
}
