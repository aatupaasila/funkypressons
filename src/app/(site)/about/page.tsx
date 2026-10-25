import type { Metadata } from "next";
import Link from "next/link";
import { NailPhoto } from "@/components/nail-photo";
import { PageIntro } from "@/components/page-intro";
import { button } from "@/components/ui";

export const metadata: Metadata = { title: "About" };

// Copy in [brackets] is waiting for her own words.
export default function AboutPage() {
  return (
    <>
      <PageIntro eyebrow="The artist" title={<>Hi, I&apos;m <em>[name]</em></>} />
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 pb-16 sm:px-6 md:grid-cols-2 md:items-start">
        <NailPhoto src="/placeholder/swan-garden.png" alt="Hand-painted swan garden set" className="rounded-3xl" sizes="(min-width: 768px) 50vw, 100vw" />
        <div className="flex flex-col gap-5 text-lg leading-relaxed">
          <p>[How Funkypressons started — a few sentences in her own voice.]</p>
          <p>
            Every set is painted by hand, one nail at a time, and sized to the person who&apos;ll wear it. Most of my
            work starts from a customer&apos;s moodboard: a handful of photos, a colour, a feeling.
          </p>
          <p>[What she loves making most, where she works from, anything personal.]</p>
          <Link href="/custom" className={`${button.primary} self-start`}>
            Design a set with me
          </Link>
        </div>
      </div>
    </>
  );
}
