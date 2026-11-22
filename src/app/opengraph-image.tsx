import { ImageResponse } from "next/og";
export const alt = "Radman Labs — Engineering Ideas Into Reality.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function OG() {
  return new ImageResponse(
    <div
      style={{
        background: "#080c14",
        color: "white",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: 80,
        justifyContent: "space-between",
      }}
    >
      <div style={{ fontSize: 32, color: "#34d399" }}>↗ radman labs</div>
      <div style={{ fontSize: 80, lineHeight: 1.1, display: "flex", flexDirection: "column" }}>
        <div>Engineering Ideas</div>
        <div>Into Reality.</div>
      </div>
      <div style={{ fontSize: 24, color: "#9da8b9" }}>
        Independent software & AI product studio
      </div>
    </div>,
    size,
  );
}
