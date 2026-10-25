import type { Metadata } from "next";
import { PageIntro } from "@/components/page-intro";
import { SizingGuide } from "@/components/sizing-guide";
import { site } from "@/content/site";

export const metadata: Metadata = { title: "Sizing & FAQ" };

const faqs = [
  {
    q: "What if I'm not sure about my size?",
    a: "Sizing kits are available — choose \"Send me a sizing kit\" in the custom form and I'll make your set once you've found your sizes. Have custom sizes that don't match a standard one? Just add your measurements when ordering.",
  },
  {
    q: "How much does a custom set cost?",
    a: "Every set is quoted personally, because the price depends on how much detail and time the design takes. Shape and length don't change the price. Send your idea through the custom form and you'll get a quote by email — no commitment.",
  },
  {
    q: "How long does it take?",
    a: "Custom sets are made after your quote is accepted and paid. If you need your nails by a certain date, add it to your request and I'll tell you honestly whether it's possible.",
  },
  {
    q: "Where do you ship?",
    a: "Finland, the UK, the US, Saudi Arabia and other countries outside the EU. Shipping to other EU countries is paused for now.",
  },
  {
    q: "Will I pay customs fees?",
    a: "Orders shipped outside Finland may be charged import duties or taxes by your country. These are paid by the recipient on delivery.",
  },
  {
    q: "Can I return a custom set?",
    a: "Custom sets are made just for you, so they can't be returned. That's why measuring carefully matters!",
  },
  {
    q: "How many times can I wear them?",
    a: "With gentle removal and care, a set can be worn again and again. Care and application tips come in every package.",
  },
];

export default function FaqPage() {
  return (
    <>
      <PageIntro eyebrow="Good to know" title={<>Sizing &amp; <em>FAQ</em></>} />
      <section id="sizing" aria-labelledby="sizing-title" className="mx-auto w-full max-w-3xl scroll-mt-28 px-5 pb-12 sm:px-6">
        <div className="rounded-3xl bg-petal p-5 sm:p-8">
          <h2 id="sizing-title" className="mb-5 font-serif text-4xl">
            How to <em>measure</em>
          </h2>
          <SizingGuide />
        </div>
      </section>
      <h2 className="mx-auto w-full max-w-3xl px-5 pb-4 font-serif text-4xl sm:px-6">Questions</h2>
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-3 px-5 pb-16 sm:px-6">
        {faqs.map((item) => (
          <details key={item.q} className="group rounded-2xl bg-white px-5 py-4 open:pb-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold">
              {item.q}
              <span aria-hidden="true" className="text-2xl text-heart transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-3 leading-relaxed text-cocoa">{item.a}</p>
          </details>
        ))}
        <p className="mt-4 text-center text-cocoa">
          Something else? Email{" "}
          <a href={`mailto:${site.email}`} className="font-semibold text-heart underline underline-offset-4">
            {site.email}
          </a>
        </p>
      </div>
    </>
  );
}
