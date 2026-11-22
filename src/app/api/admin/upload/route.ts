import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { requireAdmin } from "@/lib/supabase";
export const runtime = "nodejs";
export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== new URL(request.url).origin)
    return NextResponse.json(
      { error: "Invalid request origin." },
      { status: 403 },
    );
  try {
    const db = await requireAdmin();
    if (Number(request.headers.get("content-length")) > 4 * 1024 * 1024)
      return NextResponse.json(
        { error: "Compressed upload body must be under 4 MB." },
        { status: 413 },
      );
    const reader = request.body?.getReader();
    if (!reader) throw new Error("Image is required.");
    const chunks: Uint8Array[] = [];
    let length = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > 4 * 1024 * 1024) {
        await reader.cancel();
        throw new Error("Upload body exceeds 4 MB.");
      }
      chunks.push(value);
    }
    const body = Buffer.concat(chunks);
    const form = await new Response(new Uint8Array(body), {
      headers: { "Content-Type": request.headers.get("content-type") || "" },
    }).formData();
    const file = form.get("file");
    if (
      !(file instanceof File) ||
      file.size > 3 * 1024 * 1024 ||
      !["image/jpeg", "image/png", "image/webp"].includes(file.type)
    )
      throw new Error("Compressed image must be under 3 MB.");
    const image = sharp(Buffer.from(await file.arrayBuffer()), {
      limitInputPixels: 24000000,
    });
    const meta = await image.metadata();
    if (!["jpeg", "png", "webp"].includes(meta.format || ""))
      throw new Error("Unsupported image format.");
    const buffer = await image
      .rotate()
      .resize({
        width: 1600,
        height: 1600,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 82 })
      .toBuffer();
    const path = `${crypto.randomUUID()}.webp`;
    const { error } = await db.storage
      .from("product-images")
      .upload(path, buffer, { contentType: "image/webp", upsert: false });
    if (error) throw error;
    return NextResponse.json({
      url: db.storage.from("product-images").getPublicUrl(path).data.publicUrl,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Upload failed." },
      { status: 400 },
    );
  }
}
