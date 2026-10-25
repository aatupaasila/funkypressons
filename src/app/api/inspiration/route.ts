import { client } from "@/sanity/client";

// Receives one inspiration photo at a time from the custom order form and
// stores it in Sanity. The browser shrinks photos first, so this stays small.
const MAX_BYTES = 4 * 1024 * 1024;

/** Identifies the real format from the file's first bytes; the declared type can't be trusted */
function sniffImage(bytes: Uint8Array): string | null {
  const ascii = (start: number, end: number) => String.fromCharCode(...bytes.slice(start, end));
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes[0] === 0x89 && ascii(1, 4) === "PNG") return "image/png";
  if (ascii(0, 4) === "GIF8") return "image/gif";
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "image/webp";
  if (ascii(4, 8) === "ftyp" && ["heic", "heix", "mif1", "msf1"].includes(ascii(8, 12))) return "image/heic";
  return null;
}

export async function POST(request: Request) {
  // Reject oversized bodies before reading them
  if (Number(request.headers.get("content-length") ?? 0) > MAX_BYTES + 64 * 1024) {
    return Response.json({ error: "That photo is too large." }, { status: 413 });
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");

  if (!(file instanceof File)) return Response.json({ error: "No photo received." }, { status: 400 });
  if (file.size > MAX_BYTES) return Response.json({ error: "That photo is too large." }, { status: 413 });

  const bytes = new Uint8Array(await file.arrayBuffer());
  const type = sniffImage(bytes);
  if (!type) return Response.json({ error: "That file type isn't supported." }, { status: 415 });

  try {
    const asset = await client.assets.upload("image", Buffer.from(bytes), {
      filename: `inspiration-${Date.now()}.${type.split("/")[1]}`,
      contentType: type,
    });
    return Response.json({ assetId: asset._id });
  } catch (error) {
    console.error("Inspiration upload failed", error);
    return Response.json({ error: "Upload failed. Please try again." }, { status: 502 });
  }
}
