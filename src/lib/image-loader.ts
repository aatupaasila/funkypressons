// next/image loader. Sanity's CDN resizes and converts images itself, so the
// site doesn't need an image optimiser of its own (Cloudflare charges for one).
// Local files in /public are served as they are.
export default function imageLoader({ src, width, quality }: { src: string; width: number; quality?: number }) {
  if (!src.startsWith("https://cdn.sanity.io/")) return src;

  const url = new URL(src);
  const w = Number(url.searchParams.get("w"));
  const h = Number(url.searchParams.get("h"));
  // Keep the shape of crops (e.g. square) when changing the width
  if (w && h) url.searchParams.set("h", String(Math.round((h * width) / w)));
  url.searchParams.set("w", String(width));
  url.searchParams.set("q", String(quality ?? 75));
  url.searchParams.set("auto", "format");
  return url.toString();
}
