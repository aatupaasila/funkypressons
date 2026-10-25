// Temporary content. Products and gallery items move to Sanity so they can be
// edited from the admin; until then this file is the single source.
// Images are Instagram screenshots in public/placeholder/ — swap for clean photos.

export type NailShape = "almond" | "stiletto" | "coffin" | "square" | "oval" | "round";
export type NailLength = "S" | "M" | "L" | "XL";

export type NailSet = {
  slug: string;
  name: string;
  image: string;
  description: string;
  shape: NailShape;
  length: NailLength;
  tags: string[];
  /** Credit for the original inspiration, e.g. "@artistname" */
  inspiredBy?: string;
};

export type Product = NailSet & {
  /** EUR. null = price not set yet */
  price: number | null;
  inStock: boolean;
  isNew?: boolean;
};

export const products: Product[] = [
  {
    slug: "siamese-serenade",
    name: "Siamese Serenade",
    image: "/placeholder/siamese-serenade.png",
    description:
      "Blush pink almonds with sculpted 3D siamese cats, chrome swirls, polka dots and a little melody running across the set.",
    shape: "almond",
    length: "M",
    tags: ["3D", "cats", "pink"],
    price: null,
    inStock: true,
    isNew: true,
  },
  {
    slug: "lemon-lily",
    name: "Lemon Lily",
    image: "/placeholder/lemon-lily.png",
    description:
      "Butter yellow and matcha with speckled lilies, sliced apples, gingham and a tiny ladybird.",
    shape: "almond",
    length: "M",
    tags: ["flowers", "fruit", "green"],
    price: null,
    inStock: true,
  },
  {
    slug: "matcha-kitty",
    name: "Matcha Kitty",
    image: "/placeholder/matcha-kitty.png",
    description:
      "Matcha, pink and chocolate with a 3D kitty, piano keys, bows, lace trims and clover swirls.",
    shape: "almond",
    length: "M",
    tags: ["3D", "cats", "green"],
    price: null,
    inStock: true,
  },
  {
    slug: "rose-matcha",
    name: "Rose Matcha",
    image: "/placeholder/rose-matcha.png",
    description:
      "Square tips in rose and sage with raised petals, ice-cube details, glitter and swirling linework.",
    shape: "square",
    length: "L",
    tags: ["flowers", "3D", "pink"],
    price: null,
    inStock: false,
  },
];

export const gallery: NailSet[] = [
  {
    slug: "swan-garden",
    name: "Swan Garden",
    image: "/placeholder/swan-garden.png",
    description: "A hand-painted pond with swans, willows and water lilies.",
    shape: "almond",
    length: "L",
    tags: ["hand-painted", "green"],
  },
  {
    slug: "midnight-castle",
    name: "Midnight Castle",
    image: "/placeholder/midnight-castle.png",
    description: "Galaxy purples with a crescent moon, unicorn and a fairytale castle.",
    shape: "almond",
    length: "L",
    tags: ["purple", "hand-painted"],
  },
  {
    slug: "cherry-duck",
    name: "Cherry Duck",
    image: "/placeholder/cherry-duck.png",
    description: "Baby blue lace, cherries with bows, little ducks and a red star.",
    shape: "almond",
    length: "M",
    tags: ["cute", "blue"],
  },
  {
    slug: "bubble-pop",
    name: "Bubble Pop",
    image: "/placeholder/bubble-pop.png",
    description: "Pink marble with rainbow dots and jelly gems.",
    shape: "almond",
    length: "M",
    tags: ["pink", "gems"],
  },
  {
    slug: "acorn-forest",
    name: "Acorn Forest",
    image: "/placeholder/acorn-forest.png",
    description: "Autumn browns with 3D mushrooms, acorns and a chipmunk.",
    shape: "almond",
    length: "L",
    tags: ["3D", "autumn"],
  },
  {
    slug: "pumpkin-kitty",
    name: "Pumpkin Kitty",
    image: "/placeholder/pumpkin-kitty.png",
    description: "Halloween plaid with a black cat, pumpkins and a copper bow.",
    shape: "almond",
    length: "M",
    tags: ["3D", "halloween"],
  },
  {
    slug: "plum-frog",
    name: "Plum Frog",
    image: "/placeholder/plum-frog.png",
    description: "Plum chrome swirls, lace and a cheeky 3D frog.",
    shape: "almond",
    length: "L",
    tags: ["3D", "purple"],
  },
  {
    slug: "wild-orchid",
    name: "Wild Orchid",
    image: "/placeholder/wild-orchid.png",
    description: "Tortoiseshell and turquoise with gold studs and speckled orchids.",
    shape: "almond",
    length: "L",
    tags: ["flowers", "gold"],
  },
  ...products,
];

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}

export function formatPrice(price: number | null) {
  return price === null ? "Price TBA" : `${price} €`;
}
