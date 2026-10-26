// One-off: copies the placeholder designs and settings into Sanity so the site
// has content to show. Safe to re-run — documents use fixed ids and are replaced.
//
//   node --env-file=.env.local scripts/seed-sanity.ts

import { readFile } from "node:fs/promises";
import { createClient } from "@sanity/client";

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_TOKEN,
  apiVersion: "2026-10-01",
  useCdn: false,
});

type Seed = {
  slug: string;
  name: string;
  description: string;
  shape: string;
  length: string;
  tags: string[];
  forSale?: boolean;
  isNew?: boolean;
  inStock?: boolean;
};

const designs: Seed[] = [
  { slug: "siamese-serenade", name: "Siamese Serenade", description: "Blush pink almonds with sculpted 3D siamese cats, chrome swirls, polka dots and a little melody running across the set.", shape: "almond", length: "M", tags: ["3D", "cats", "pink"], forSale: true, isNew: true },
  { slug: "lemon-lily", name: "Lemon Lily", description: "Butter yellow and matcha with speckled lilies, sliced apples, gingham and a tiny ladybird.", shape: "almond", length: "M", tags: ["flowers", "fruit", "green"], forSale: true },
  { slug: "matcha-kitty", name: "Matcha Kitty", description: "Matcha, pink and chocolate with a 3D kitty, piano keys, bows, lace trims and clover swirls.", shape: "almond", length: "M", tags: ["3D", "cats", "green"], forSale: true },
  { slug: "rose-matcha", name: "Rose Matcha", description: "Square tips in rose and sage with raised petals, ice-cube details, glitter and swirling linework.", shape: "square", length: "L", tags: ["flowers", "3D", "pink"], forSale: true, inStock: false },
  { slug: "swan-garden", name: "Swan Garden", description: "A hand-painted pond with swans, willows and water lilies.", shape: "almond", length: "L", tags: ["hand-painted", "green"] },
  { slug: "midnight-castle", name: "Midnight Castle", description: "Galaxy purples with a crescent moon, unicorn and a fairytale castle.", shape: "almond", length: "L", tags: ["purple", "hand-painted"] },
  { slug: "cherry-teddy", name: "Cherry Teddy", description: "Cherry red and cream with 3D teddy bears, chrome bows, sliced apples and a lattice pie.", shape: "almond", length: "M", tags: ["3D", "red", "cute"] },
  { slug: "bubble-pop", name: "Bubble Pop", description: "Pink marble with rainbow dots and jelly gems.", shape: "almond", length: "M", tags: ["pink", "gems"] },
  { slug: "acorn-forest", name: "Acorn Forest", description: "Autumn browns with 3D mushrooms, acorns and a chipmunk.", shape: "almond", length: "L", tags: ["3D", "autumn"] },
  { slug: "pumpkin-kitty", name: "Pumpkin Kitty", description: "Halloween plaid with a black cat, pumpkins and a copper bow.", shape: "almond", length: "M", tags: ["3D", "halloween"] },
  { slug: "plum-frog", name: "Plum Frog", description: "Plum chrome swirls, lace and a cheeky 3D frog.", shape: "almond", length: "L", tags: ["3D", "purple"] },
  { slug: "wild-orchid", name: "Wild Orchid", description: "Tortoiseshell and turquoise with gold studs and speckled orchids.", shape: "almond", length: "L", tags: ["flowers", "gold"] },
];

const settings = {
  _id: "siteSettings",
  _type: "siteSettings",
  announcement: "Shipping worldwide ✦ Custom sets open",
  shippingCountries: ["Finland", "United Kingdom", "United States", "Saudi Arabia", "Other (outside the EU)"],
  baseColours: [
    ["Clear", "#F4F1F2"],
    ["Milky white", "#F7F2EC"],
    ["Sheer pink", "#F6C9D4"],
    ["Nude", "#E8C2AE"],
    ["Peach", "#F7C6A3"],
    ["Bubblegum", "#FFB3D9"],
    ["Matcha", "#C3D588"],
    ["Lilac", "#CDB8E6"],
    ["Black", "#2A2224"],
  ].map(([name, hex], i) => ({ _key: `colour${i}`, _type: "baseColour", name, hex })),
  shapes: ["almond", "stiletto", "coffin", "square", "oval", "round"].map((shape, i) => ({
    _key: `shape${i}`,
    _type: "shapeOption",
    shape,
    available: true,
  })),
};

// Oldest first, so the first entries end up newest in "newest first" lists
for (const seed of [...designs].reverse()) {
  const file = await readFile(`public/placeholder/${seed.slug}.png`);
  const asset = await client.assets.upload("image", file, { filename: `${seed.slug}.png` });
  await client.createOrReplace({
    _id: `design-${seed.slug}`,
    _type: "design",
    name: seed.name,
    slug: { _type: "slug", current: seed.slug },
    images: [{ _key: "main", _type: "image", asset: { _type: "reference", _ref: asset._id } }],
    description: seed.description,
    shape: seed.shape,
    length: seed.length,
    tags: seed.tags,
    showInGallery: true,
    forSale: seed.forSale ?? false,
    inStock: seed.inStock ?? true,
    isNew: seed.isNew ?? false,
  });
  console.log("✓", seed.name);
}

await client.createOrReplace(settings);
console.log("✓ Site settings");
