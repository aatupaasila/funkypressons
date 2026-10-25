import { defineField, defineType } from "sanity";

// One document per nail set. The same set can appear in the gallery, the shop, or both.
export const design = defineType({
  name: "design",
  title: "Design",
  type: "document",
  groups: [
    { name: "details", title: "Details", default: true },
    { name: "shop", title: "Shop" },
  ],
  fields: [
    defineField({ name: "name", title: "Name", type: "string", group: "details", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      title: "Web address",
      description: "Click Generate after typing the name.",
      type: "slug",
      group: "details",
      options: { source: "name", maxLength: 80 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "images",
      title: "Photos",
      description: "The first photo is the main one. Plain white background works best.",
      type: "array",
      group: "details",
      of: [{ type: "image", options: { hotspot: true } }],
      validation: (r) => r.required().min(1),
    }),
    defineField({ name: "description", title: "Description", type: "text", rows: 3, group: "details" }),
    defineField({
      name: "shape",
      title: "Shape",
      type: "string",
      group: "details",
      options: { list: ["almond", "stiletto", "coffin", "square", "oval", "round"], layout: "radio", direction: "horizontal" },
    }),
    defineField({
      name: "length",
      title: "Length",
      type: "string",
      group: "details",
      options: { list: ["S", "M", "L", "XL"], layout: "radio", direction: "horizontal" },
    }),
    defineField({ name: "tags", title: "Tags", type: "array", group: "details", of: [{ type: "string" }], options: { layout: "tags" } }),
    defineField({
      name: "inspiredBy",
      title: "Inspired by",
      description: "Credit the original artist, e.g. @artistname. Leave empty if it's your own idea.",
      type: "string",
      group: "details",
    }),
    defineField({ name: "showInGallery", title: "Show in gallery", type: "boolean", group: "details", initialValue: true }),

    defineField({ name: "forSale", title: "Sell in shop", type: "boolean", group: "shop", initialValue: false }),
    defineField({
      name: "price",
      title: "Price (€)",
      type: "number",
      group: "shop",
      hidden: ({ document }) => !document?.forSale,
      validation: (r) => r.min(0),
    }),
    defineField({ name: "inStock", title: "Available", type: "boolean", group: "shop", initialValue: true, hidden: ({ document }) => !document?.forSale }),
    defineField({ name: "isNew", title: "Show “New” tag", type: "boolean", group: "shop", initialValue: false, hidden: ({ document }) => !document?.forSale }),
  ],
  orderings: [{ title: "Newest first", name: "newest", by: [{ field: "_createdAt", direction: "desc" }] }],
  preview: {
    select: { title: "name", media: "images.0", forSale: "forSale", price: "price", inStock: "inStock" },
    prepare: ({ title, media, forSale, price, inStock }) => ({
      title,
      media,
      subtitle: forSale ? `Shop · ${price ?? "no price"} €${inStock === false ? " · sold out" : ""}` : "Gallery only",
    }),
  },
});
