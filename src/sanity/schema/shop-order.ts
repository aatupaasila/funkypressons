import { defineField, defineType } from "sanity";

export const orderStatuses = [
  { title: "💳 Paid — to do", value: "paid" },
  { title: "🎨 In progress", value: "in-progress" },
  { title: "📦 Shipped", value: "shipped" },
  { title: "✖ Cancelled / refunded", value: "cancelled" },
];

// Created by the website when a shop purchase is paid in Stripe
export const shopOrder = defineType({
  name: "shopOrder",
  title: "Shop order",
  type: "document",
  groups: [
    { name: "manage", title: "Manage", default: true },
    { name: "details", title: "Order" },
  ],
  fields: [
    defineField({ name: "status", title: "Status", type: "string", group: "manage", options: { list: orderStatuses, layout: "radio" }, initialValue: "paid" }),
    defineField({ name: "tracking", title: "Tracking number", type: "string", group: "manage" }),
    defineField({ name: "notes", title: "My notes", description: "Only visible to you.", type: "text", rows: 3, group: "manage" }),
    defineField({ name: "reference", title: "Reference", type: "string", group: "manage", readOnly: true }),
    defineField({ name: "paidAt", title: "Paid", type: "datetime", group: "manage", readOnly: true }),

    defineField({ name: "design", title: "Design", type: "reference", to: [{ type: "design" }], weak: true, group: "details", readOnly: true }),
    defineField({ name: "designName", title: "Set", type: "string", group: "details", readOnly: true }),
    defineField({ name: "fulfilment", title: "Type", type: "string", group: "details", readOnly: true }),
    defineField({ name: "sizes", title: "Sizes", type: "text", rows: 3, group: "details", readOnly: true }),
    defineField({ name: "amountPaid", title: "Paid in total (€)", type: "number", group: "details", readOnly: true }),
    defineField({ name: "shippingPaid", title: "of which shipping (€)", type: "number", group: "details", readOnly: true }),
    defineField({ name: "name", title: "Customer", type: "string", group: "details", readOnly: true }),
    defineField({ name: "email", title: "Email", type: "string", group: "details", readOnly: true }),
    defineField({ name: "phone", title: "Phone", type: "string", group: "details", readOnly: true }),
    defineField({ name: "shippingAddress", title: "Ship to address", type: "text", rows: 4, group: "details", readOnly: true }),
    defineField({ name: "stripeSessionId", type: "string", hidden: true }),
  ],
  orderings: [{ title: "Newest first", name: "newest", by: [{ field: "paidAt", direction: "desc" }] }],
  preview: {
    select: { name: "name", set: "designName", status: "status", reference: "reference", media: "design.images.0" },
    prepare: ({ name, set, status, reference, media }) => ({
      title: `${set ?? "Order"} — ${name ?? ""}`,
      subtitle: [orderStatuses.find((s) => s.value === status)?.title, reference].filter(Boolean).join(" · "),
      media,
    }),
  },
});
