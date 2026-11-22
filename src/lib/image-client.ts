"use client";
export async function compressImage(file: File) {
  if (
    file.size > 8 * 1024 * 1024 ||
    !["image/jpeg", "image/png", "image/webp"].includes(file.type)
  )
    throw new Error("Choose a JPEG, PNG, or WebP image under 8 MB.");
  const bitmap = await createImageBitmap(file);
  try {
    if (bitmap.width * bitmap.height > 24000000)
      throw new Error("Image must be under 24 megapixels.");
    const ratio = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * ratio);
    canvas.height = Math.round(bitmap.height * ratio);
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Image compression is unavailable.");
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (b) =>
          b ? resolve(b) : reject(new Error("Image compression failed.")),
        "image/webp",
        0.82,
      ),
    );
    if (blob.size > 3 * 1024 * 1024)
      throw new Error("Compressed image is too large. Choose a smaller image.");
    return new File([blob], "upload.webp", { type: "image/webp" });
  } finally {
    bitmap.close();
  }
}
