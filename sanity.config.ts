"use client";

import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { SendPaymentLinkAction } from "./src/sanity/actions/send-payment-link";
import { dataset, projectId } from "./src/sanity/env";
import { schemaTypes } from "./src/sanity/schema";
import { structure } from "./src/sanity/structure";

// Studio lives at /studio on the website
export default defineConfig({
  basePath: "/studio",
  projectId,
  dataset,
  title: "Funkypressons",
  plugins: [structureTool({ structure })],
  schema: {
    types: schemaTypes,
    // Site settings is a single document, so hide it from "Create new"
    templates: (templates) => templates.filter((t) => t.schemaType !== "siteSettings"),
  },
  document: {
    // Requests and orders come from the website, not the Studio
    newDocumentOptions: (prev) => prev.filter((item) => !["customRequest", "shopOrder", "siteSettings"].includes(item.templateId)),
    actions: (prev, { schemaType }) => {
      if (schemaType === "siteSettings") return prev.filter((a) => !["unpublish", "delete", "duplicate"].includes(a.action ?? ""));
      if (schemaType === "customRequest") return [SendPaymentLinkAction, ...prev];
      if (schemaType === "shopOrder") return prev.filter((a) => a.action !== "duplicate");
      return prev;
    },
  },
});
