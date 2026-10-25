"use client";

import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
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
    // Requests come from the website, not the Studio
    newDocumentOptions: (prev) => prev.filter((item) => item.templateId !== "customRequest" && item.templateId !== "siteSettings"),
    actions: (prev, { schemaType }) =>
      schemaType === "siteSettings" ? prev.filter((a) => !["unpublish", "delete", "duplicate"].includes(a.action ?? "")) : prev,
  },
});
