import type { Metadata } from "next";
import { getGallery, getSettings } from "@/sanity/queries";
import { CustomOrderForm } from "./custom-order-form";

export const metadata: Metadata = {
  title: "Custom order",
  description: "Design a hand-painted press-on set from your own inspiration and get a personal quote.",
};

export default async function CustomPage() {
  const [gallery, { shippingCountries, baseColours }] = await Promise.all([getGallery(), getSettings()]);
  const designs = gallery.map(({ slug, name, image }) => ({ slug, name, image }));
  return <CustomOrderForm designs={designs} options={{ shippingCountries, baseColours }} />;
}
