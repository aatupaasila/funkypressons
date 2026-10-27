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
  /** made-to-order: made in the buyer's size; ready-made: one finished set, sold once */
  fulfilment: "made-to-order" | "ready-made";
  /** Ready-made sets only: the size it was made in, as she wrote it */
  readySize?: string;
};

export function formatPrice(price: number | null) {
  return price === null ? "Price TBA" : `${price} €`;
}
