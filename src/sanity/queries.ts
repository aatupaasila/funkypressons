import "server-only";
import { defineQuery } from "next-sanity";
import type { NailLength, NailSet, NailShape, Product } from "@/content/catalog";
import { defaultBaseColours, defaultShippingCountries } from "@/content/order-options";
import { sanityFetch } from "./client";
import { squareImageUrl } from "./image";

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
const settingsQuery = defineQuery(`*[_id == "siteSettings"][0] { announcement, shippingCountries, baseColours[] { name, hex } }`);

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
};

// Used until the settings document has been filled in
const defaultSettings: SiteSettings = {
  announcement: "Shipping worldwide ✦ Custom sets open",
  shippingCountries: defaultShippingCountries,
  baseColours: defaultBaseColours,
};

export async function getSettings(): Promise<SiteSettings> {
  const row = await sanityFetch<Partial<{ announcement: string; shippingCountries: string[]; baseColours: { name: string; hex: string }[] }> | null>(
    settingsQuery,
  );
  return {
    announcement: row?.announcement || defaultSettings.announcement,
    shippingCountries: row?.shippingCountries?.length ? row.shippingCountries : defaultSettings.shippingCountries,
    baseColours: row?.baseColours?.length
      ? row.baseColours.map((c) => ({ id: c.name.toLowerCase().replace(/\s+/g, "-"), name: c.name, hex: c.hex }))
      : defaultSettings.baseColours,
  };
}
