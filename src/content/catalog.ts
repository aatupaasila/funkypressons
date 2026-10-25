// Shapes of the designs fetched from Sanity (see src/sanity/queries.ts).

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

export function formatPrice(price: number | null) {
  return price === null ? "Price TBA" : `${price} €`;
}
