import type { Metadata } from "next";
import { gallery } from "@/content/catalog";
import { CustomOrderForm } from "./custom-order-form";

export const metadata: Metadata = {
  title: "Custom order",
  description: "Design a hand-painted press-on set from your own inspiration and get a personal quote.",
};

export default function CustomPage() {
  const designs = gallery.map(({ slug, name, image }) => ({ slug, name, image }));
  return <CustomOrderForm designs={designs} />;
}
