import { revalidateTag } from "next/cache";
import type { NextRequest } from "next/server";
import { parseBody } from "next-sanity/webhook";

// Called by a Sanity webhook whenever content is published, so changes made
// in the Studio show up on the site right away instead of within a minute.
export async function POST(request: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) return Response.json({ error: "Revalidation is not configured" }, { status: 500 });

  const { isValidSignature, body } = await parseBody<{ _type?: string }>(request, secret, true);
  if (!isValidSignature) return Response.json({ error: "Invalid signature" }, { status: 401 });

  // expire: 0 — she'll refresh to check her change, so never serve the old version
  revalidateTag("sanity", { expire: 0 });
  return Response.json({ revalidated: true, type: body?._type ?? null });
}
