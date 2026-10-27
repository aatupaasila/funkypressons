import { defineField, defineType } from "sanity";

export const requestStatuses = [
  { title: "🆕 New", value: "new" },
  { title: "💬 Quote sent", value: "quoted" },
  { title: "💳 Paid", value: "paid" },
  { title: "🎨 In progress", value: "in-progress" },
  { title: "📦 Shipped", value: "shipped" },
  { title: "✖ Declined", value: "declined" },
];

// Created by the website when someone sends the custom order form
export const customRequest = defineType({
  name: "customRequest",
  title: "Custom request",
  type: "document",
  groups: [
    { name: "manage", title: "Manage", default: true },
    { name: "order", title: "Order" },
    { name: "customer", title: "Customer" },
  ],
  fields: [
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      group: "manage",
      options: { list: requestStatuses, layout: "radio" },
      initialValue: "new",
    }),
    defineField({
      name: "quote",
      title: "Quoted price incl. shipping (€)",
      description: "Then press “Send payment link” at the bottom to email the customer a link to pay this amount.",
      type: "number",
      group: "manage",
      validation: (r) => r.min(1),
    }),
    defineField({
      name: "payment",
      title: "Payment",
      type: "object",
      group: "manage",
      readOnly: true,
      // Filled in by the website: the link sent, and the payment once it arrives
      hidden: ({ value }) => !value?.linkUrl,
      fields: [
        defineField({ name: "linkUrl", title: "Payment link", type: "url" }),
        defineField({ name: "linkAmount", title: "Link amount (€)", type: "number" }),
        defineField({ name: "linkSentAt", title: "Link sent", type: "datetime" }),
        defineField({ name: "paidAt", title: "Paid", type: "datetime" }),
        defineField({ name: "amountPaid", title: "Amount paid (€)", type: "number" }),
        defineField({ name: "shippingAddress", title: "Ship to address", type: "text", rows: 4 }),
        defineField({ name: "linkId", type: "string", hidden: true }),
        defineField({ name: "stripeSessionId", type: "string", hidden: true }),
      ],
    }),
    // Set by the “Send payment link” button; the website reacts to it
    defineField({ name: "paymentRequestedAt", type: "datetime", hidden: true }),
    defineField({ name: "notes", title: "My notes", description: "Only visible to you.", type: "text", rows: 4, group: "manage" }),
    defineField({ name: "reference", title: "Reference", type: "string", group: "manage", readOnly: true }),
    defineField({ name: "submittedAt", title: "Sent", type: "datetime", group: "manage", readOnly: true }),

    defineField({ name: "setType", title: "Set type", type: "string", group: "order" }),
    defineField({ name: "existingDesign", title: "Past design", type: "reference", to: [{ type: "design" }], group: "order" }),
    defineField({ name: "vision", title: "Their vision", type: "text", rows: 5, group: "order" }),
    defineField({
      name: "inspiration",
      title: "Inspiration photos",
      type: "array",
      group: "order",
      of: [
        {
          type: "object",
          name: "inspirationPhoto",
          fields: [
            defineField({ name: "image", type: "image" }),
            defineField({ name: "credit", title: "Artist credit", type: "string" }),
          ],
          preview: { select: { media: "image", title: "credit" }, prepare: ({ media, title }) => ({ media, title: title || "No credit given" }) },
        },
      ],
      options: { layout: "grid" },
    }),
    defineField({ name: "shape", title: "Shape", type: "string", group: "order" }),
    defineField({ name: "length", title: "Length", type: "string", group: "order" }),
    defineField({ name: "baseColour", title: "Base colour", type: "string", group: "order" }),
    defineField({ name: "sizes", title: "Sizes", type: "text", rows: 3, group: "order" }),
    // No longer asked; kept so older requests still show the answer
    defineField({ name: "toes", title: "Matching toes", type: "boolean", group: "order", readOnly: true, hidden: ({ value }) => value === undefined }),
    defineField({ name: "deadline", title: "Needed by", type: "date", group: "order" }),

    defineField({ name: "name", title: "Name", type: "string", group: "customer" }),
    defineField({ name: "email", title: "Email", type: "string", group: "customer" }),
    defineField({ name: "instagram", title: "Instagram", type: "string", group: "customer" }),
    defineField({ name: "country", title: "Ship to", type: "string", group: "customer" }),
    defineField({ name: "countryCode", type: "string", group: "customer", hidden: true }),
    defineField({ name: "referral", title: "Recommended by", type: "string", group: "customer" }),
  ],
  orderings: [{ title: "Newest first", name: "newest", by: [{ field: "submittedAt", direction: "desc" }] }],
  preview: {
    select: { name: "name", reference: "reference", status: "status", country: "country", media: "inspiration.0.image" },
    prepare: ({ name, reference, status, country, media }) => ({
      title: name || "Unnamed",
      subtitle: [requestStatuses.find((s) => s.value === status)?.title, reference, country].filter(Boolean).join(" · "),
      media,
    }),
  },
});
