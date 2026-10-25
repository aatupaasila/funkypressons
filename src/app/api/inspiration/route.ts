import { client } from "@/sanity/client";

// Receives one inspiration photo at a time from the custom order form and
// stores it in Sanity. The browser shrinks photos first, so this stays small.
const MAX_BYTES = 4 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/heic", "image/heif"];

export async function POST(request: Request) {
  const form = await request.formData().catch(() => null);
  const file = form?.get("file");

  if (!(file instanceof File)) return Response.json({ error: "No photo received." }, { status: 400 });
  if (!ALLOWED.includes(file.type)) return Response.json({ error: "That file type isn't supported." }, { status: 415 });
  if (file.size > MAX_BYTES) return Response.json({ error: "That photo is too large." }, { status: 413 });

  try {
    const asset = await client.assets.upload("image", Buffer.from(await file.arrayBuffer()), {
      filename: file.name.slice(0, 100),
      contentType: file.type,
    });
    return Response.json({ assetId: asset._id });
  } catch (error) {
    console.error("Inspiration upload failed", error);
    return Response.json({ error: "Upload failed. Please try again." }, { status: 502 });
  }
}
