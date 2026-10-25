import { defineField, defineType } from "sanity";

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
      name: "shippingCountries",
      title: "Shipping countries",
      description: "Countries customers can choose in the custom order form.",
      type: "array",
      of: [{ type: "string" }],
      validation: (r) => r.min(1),
    }),
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
  ],
  preview: { prepare: () => ({ title: "Site settings" }) },
});
