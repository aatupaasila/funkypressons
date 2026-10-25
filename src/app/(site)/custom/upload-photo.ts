// Client-side helpers for sending inspiration photos.

const MAX_EDGE = 2000;
const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

/** Shrinks a photo to at most 2000px on its long edge as a JPEG. Falls back to the original if the browser can't decode it. */
async function shrink(file: File): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
    return blob ?? file;
  } catch {
    return file;
  }
}

export async function uploadInspirationPhoto(file: File): Promise<string> {
  const blob = await shrink(file);
  if (blob.size > MAX_UPLOAD_BYTES) throw new Error(`"${file.name}" is too large to send — try a screenshot of it instead.`);

  const body = new FormData();
  const name = blob === file ? file.name : file.name.replace(/\.\w+$/, "") + ".jpg";
  body.append("file", blob, name);

  const response = await fetch("/api/inspiration", { method: "POST", body });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.assetId) throw new Error(data.error ?? "Uploading a photo failed. Please try again.");
  return data.assetId;
}
