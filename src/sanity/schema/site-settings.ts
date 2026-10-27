import { defineField, defineType } from "sanity";
import { countries } from "../../content/countries";
import { shapes } from "../../content/order-options";

// Single document: things she may want to change without touching code
export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  fields: [
    defineField({
      name: "announcement",
      title: "Top bar text",
      description: "The green bar at the very top of every page.",
      type: "string",
      initialValue: "Shipping worldwide ✦ Custom sets open",
    }),
    defineField({
      name: "shippingZones",
      title: "Shipping",
      description:
        "Where you ship and what it costs. Each zone is a group of countries with one price. Only these countries can be chosen in the shop and the custom order form.",
      type: "array",
      of: [
        {
          type: "object",
          name: "shippingZone",
          fields: [
            defineField({ name: "name", title: "Zone name", description: "e.g. Finland, or Rest of the world", type: "string", validation: (r) => r.required() }),
            defineField({
              name: "countries",
              title: "Countries",
              type: "array",
              of: [{ type: "string", options: { list: countries.map((c) => ({ title: c.name, value: c.code })) } }],
              validation: (r) => r.required().min(1).unique(),
            }),
            defineField({ name: "price", title: "Shipping price (€)", description: "Use 0 for free shipping.", type: "number", validation: (r) => r.required().min(0) }),
            defineField({ name: "delivery", title: "Delivery time", description: "Shown to customers, e.g. “2–5 working days”.", type: "string" }),
          ],
          preview: {
            select: { title: "name", price: "price", countries: "countries" },
            prepare: ({ title, price, countries: list }) => ({
              title,
              subtitle: `${price ?? "?"} € · ${(list ?? []).length} ${(list ?? []).length === 1 ? "country" : "countries"}`,
            }),
          },
        },
      ],
      validation: (r) =>
        r.min(1).custom((zones: { countries?: string[] }[] | undefined) => {
          const all = (zones ?? []).flatMap((z) => z.countries ?? []);
          return new Set(all).size === all.length || "A country can only be in one zone.";
        }),
    }),
    // Replaced by shippingZones; kept hidden so older data doesn't show as an unknown field
    defineField({ name: "shippingCountries", type: "array", of: [{ type: "string" }], hidden: true }),
    defineField({
      name: "baseColours",
      title: "Base colours",
      description: "Gel colours offered in the custom order form.",
      type: "array",
      of: [
        {
          type: "object",
          name: "baseColour",
          fields: [
            defineField({ name: "name", type: "string", validation: (r) => r.required() }),
            defineField({
              name: "hex",
              title: "Colour code",
              description: "e.g. #FFB3D9",
              type: "string",
              validation: (r) => r.required().regex(/^#[0-9a-fA-F]{6}$/, { name: "hex colour" }),
            }),
          ],
          preview: { select: { title: "name", subtitle: "hex" } },
        },
      ],
    }),
    defineField({
      name: "shapes",
      title: "Nail shapes",
      description:
        "Shapes offered in the custom order form, in this order. Turn off “Available” to hide one for now. If the list is empty, all six are shown.",
      type: "array",
      of: [
        {
          type: "object",
          name: "shapeOption",
          fields: [
            defineField({
              name: "shape",
              title: "Shape",
              type: "string",
              options: { list: shapes.map((s) => ({ title: s.name, value: s.id })) },
              validation: (r) => r.required(),
            }),
            defineField({ name: "name", title: "Name shown", description: "Leave empty to use the standard name.", type: "string" }),
            defineField({
              name: "note",
              title: "Short note",
              description: "Optional, e.g. “Best for short nails”.",
              type: "string",
              validation: (r) => r.max(60),
            }),
            defineField({ name: "available", title: "Available", type: "boolean", initialValue: true }),
          ],
          preview: {
            select: { shape: "shape", name: "name", available: "available" },
            prepare: ({ shape, name, available }) => ({
              title: name || shapes.find((s) => s.id === shape)?.name || "Choose a shape",
              subtitle: available === false ? "Hidden" : "Available",
            }),
          },
        },
      ],
      validation: (r) =>
        r.custom((items: { shape?: string }[] | undefined) => {
          const ids = (items ?? []).map((i) => i.shape).filter(Boolean);
          return new Set(ids).size === ids.length || "Each shape can only be listed once.";
        }),
    }),
    defineField({
      name: "hero",
      title: "Front page picture",
      description: "The big picture at the top of the front page.",
      type: "object",
      fields: [
        defineField({
          name: "mode",
          title: "Show",
          type: "string",
          options: {
            list: [
              { title: "Slideshow of sets", value: "slideshow" },
              { title: "One picture (e.g. the logo)", value: "image" },
            ],
            layout: "radio",
          },
          initialValue: "slideshow",
        }),
        defineField({
          name: "sets",
          title: "Sets in the slideshow",
          description: "Their main photos fade from one to the next, in this order. Leave empty to show the six newest sets.",
          type: "array",
          of: [{ type: "reference", to: [{ type: "design" }] }],
          hidden: ({ parent }) => parent?.mode === "image",
          validation: (r) => r.unique(),
        }),
        defineField({
          name: "image",
          title: "Picture",
          type: "image",
          options: { hotspot: true },
          hidden: ({ parent }) => parent?.mode !== "image",
          fields: [defineField({ name: "alt", title: "Description", description: "What the picture shows, for screen readers.", type: "string" })],
        }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Site settings" }) },
});
