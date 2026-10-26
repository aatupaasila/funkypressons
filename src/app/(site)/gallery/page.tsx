import type { Metadata } from "next";
import Link from "next/link";
import { getGallery } from "@/sanity/queries";
import { PageIntro } from "@/components/page-intro";
import { GalleryGrid } from "./gallery-grid";

export const metadata: Metadata = { title: "Gallery" };

export default async function GalleryPage() {
  const gallery = await getGallery();
  return (
    <>
      <PageIntro eyebrow="Every set I've made" title={<>The <em>gallery</em></>}>
        Love one of these? Any set can be remade to your sizes —{" "}
        <Link href="/custom" className="font-semibold text-heart underline underline-offset-4">
          request it here
        </Link>
        .
      </PageIntro>
      <GalleryGrid sets={gallery} />
    </>
  );
}
