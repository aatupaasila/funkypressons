import "server-only";
import { defineQuery } from "next-sanity";
import type { NailLength, NailSet, NailShape, Product } from "@/content/catalog";
import { defaultBaseColours, defaultShapes, defaultShippingCountries, type ShapeOption } from "@/content/order-options";
import { sanityFetch } from "./client";
import { imageUrl, squareImageUrl } from "./image";

type DesignRow = {
  slug: string;
  name: string;
  image: { asset?: { _ref: string } } | null;
  description: string | null;
  shape: NailShape | null;
  length: NailLength | null;
  tags: string[] | null;
  inspiredBy: string | null;
  price: number | null;
  inStock: boolean | null;
  isNew: boolean | null;
};

const designFields = `
  "slug": slug.current,
  name,
  "image": images[0],
  description,
  shape,
  length,
  tags,
  inspiredBy,
  price,
  inStock,
  isNew
`;

const galleryQuery = defineQuery(
  `*[_type == "design" && showInGallery != false && defined(slug.current)] | order(_createdAt desc) { ${designFields} }`,
);
const productsQuery = defineQuery(
  `*[_type == "design" && forSale == true && defined(slug.current)] | order(_createdAt desc) { ${designFields} }`,
);
const productQuery = defineQuery(`*[_type == "design" && forSale == true && slug.current == $slug][0] { ${designFields} }`);
const settingsQuery = defineQuery(
  `*[_id == "siteSettings"][0] { announcement, shippingCountries, baseColours[] { name, hex }, shapes[] { shape, name, note, available },
    hero { mode, "sets": sets[]->{ name, "image": images[0] }[defined(image.asset)], image } }`,
);

type SanityImage = { asset?: { _ref: string } };

type SettingsRow = {
  announcement: string;
  shippingCountries: string[];
  baseColours: { name: string; hex: string }[];
  shapes: { shape: string | null; name: string | null; note: string | null; available: boolean | null }[];
  hero: {
    mode: "slideshow" | "image" | null;
    sets: { name: string; image: SanityImage }[] | null;
    image: (SanityImage & { alt?: string }) | null;
  };
};

function toNailSet(row: DesignRow): NailSet {
  return {
    slug: row.slug,
    name: row.name,
    image: row.image?.asset ? squareImageUrl(row.image) : "/placeholder/swan-garden.png",
    description: row.description ?? "",
    shape: row.shape ?? "almond",
    length: row.length ?? "M",
    tags: row.tags ?? [],
    inspiredBy: row.inspiredBy ?? undefined,
  };
}

function toProduct(row: DesignRow): Product {
  return { ...toNailSet(row), price: row.price, inStock: row.inStock !== false, isNew: row.isNew ?? false };
}

export async function getGallery() {
  return (await sanityFetch<DesignRow[]>(galleryQuery)).map(toNailSet);
}

export async function getProducts() {
  return (await sanityFetch<DesignRow[]>(productsQuery)).map(toProduct);
}

export async function getProduct(slug: string) {
  const row = await sanityFetch<DesignRow | null>(productQuery, { slug });
  return row ? toProduct(row) : null;
}

export type SiteSettings = {
  announcement: string;
  shippingCountries: string[];
  baseColours: { id: string; name: string; hex: string }[];
  /** Only the shapes currently available, in her order */
  shapes: ShapeOption[];
  /** The front page picture. No slides means she hasn't picked any: the page uses the newest sets */
  hero: { mode: "slideshow" | "image"; slides: { src: string; alt: string }[] };
};

// Used until the settings document has been filled in
const defaultSettings: SiteSettings = {
  announcement: "Shipping worldwide ✦ Custom sets open",
  shippingCountries: defaultShippingCountries,
  baseColours: defaultBaseColours,
  shapes: defaultShapes,
  hero: { mode: "slideshow", slides: [] },
};

function toHero(row: SettingsRow["hero"] | undefined): SiteSettings["hero"] {
  if (row?.mode === "image") {
    const image = row.image?.asset ? row.image : null;
    return { mode: "image", slides: image ? [{ src: imageUrl(image), alt: image.alt ?? "" }] : [] };
  }
  return { mode: "slideshow", slides: (row?.sets ?? []).map((set) => ({ src: squareImageUrl(set.image), alt: set.name })) };
}

function toShapes(rows: SettingsRow["shapes"]): ShapeOption[] {
  return rows.flatMap((row) => {
    const standard = defaultShapes.find((s) => s.id === row.shape);
    if (!standard || row.available === false) return [];
    return [{ ...standard, name: row.name?.trim() || standard.name, note: row.note?.trim() ?? "" }];
  });
}

export async function getSettings(): Promise<SiteSettings> {
  const row = await sanityFetch<Partial<SettingsRow> | null>(settingsQuery);
  return {
    announcement: row?.announcement || defaultSettings.announcement,
    shippingCountries: row?.shippingCountries?.length ? row.shippingCountries : defaultSettings.shippingCountries,
    baseColours: row?.baseColours?.length
      ? row.baseColours.map((c) => ({ id: c.name.toLowerCase().replace(/\s+/g, "-"), name: c.name, hex: c.hex }))
      : defaultSettings.baseColours,
    // An empty list means all shapes; a list with every shape hidden means none
    shapes: row?.shapes?.length ? toShapes(row.shapes) : defaultSettings.shapes,
    hero: toHero(row?.hero),
  };
}
