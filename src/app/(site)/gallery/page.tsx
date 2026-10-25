import type { Metadata } from "next";
import Link from "next/link";
import { getGallery } from "@/sanity/queries";
import { NailPhoto } from "@/components/nail-photo";
import { PageIntro } from "@/components/page-intro";

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
      <ul className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-x-4 gap-y-6 px-5 pb-16 sm:px-6 md:grid-cols-3 lg:grid-cols-4">
        {gallery.map((set) => (
          <li key={set.slug} className="flex flex-col gap-2">
            <NailPhoto src={set.image} alt={set.description} className="rounded-[20px]" />
            <span className="font-serif text-xl leading-tight">{set.name}</span>
            {set.inspiredBy && <span className="-mt-1 text-sm text-cocoa italic">Inspired by {set.inspiredBy}</span>}
          </li>
        ))}
      </ul>
    </>
  );
}
