import Link from "next/link";
import { getGallery, getProducts, getSettings } from "@/sanity/queries";
import { HeroSlideshow } from "@/components/hero-slideshow";
import { InstagramButton } from "@/components/instagram-button";
import { NailPhoto } from "@/components/nail-photo";
import { ProductCard } from "@/components/product-card";
import { Sparkle } from "@/components/sparkle";
import { button } from "@/components/ui";

const steps = [
  { title: "Send your inspo", text: "Pinterest boards, photos, colours, a friend's nails — anything goes." },
  { title: "Get your quote", text: "I'll look at your idea and email you a personal price and timeline." },
  { title: "Wear your art", text: "Hand-painted, sized to your nails and shipped worldwide." },
];

export default async function Home() {
  const [products, gallery, { hero }] = await Promise.all([getProducts(), getGallery(), getSettings()]);
  // Nothing picked in the Studio yet: the newest sets, or just the newest one as a still picture
  const heroSlides = hero.slides.length
    ? hero.slides
    : gallery.slice(0, hero.mode === "image" ? 1 : 6).map((set) => ({ src: set.image, alt: set.name }));
  return (
    <>
      <section className="relative overflow-hidden bg-bubblegum">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-40 -right-32 size-[560px] rounded-full bg-[radial-gradient(circle,rgba(240,69,122,0.5)_0%,rgba(240,69,122,0)_68%)]"
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-8 px-5 py-8 sm:px-6 md:grid-cols-2 md:gap-12 md:py-16">
          <HeroSlideshow slides={heroSlides} className="rounded-3xl md:order-2" sizes="(min-width: 768px) 50vw, 100vw" />
          <div className="flex flex-col gap-5">
            <h1 className="font-serif text-[44px] leading-[1.02] sm:text-6xl lg:text-7xl">
              Nails as one-of-a-kind as <em>your moodboard</em>
            </h1>
            <p className="max-w-md text-base leading-relaxed sm:text-lg">
              Hand-painted press-ons, sized to fit you and made from whatever inspires you — strawberries, your
              dog, a colour you can&apos;t stop thinking about.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/custom" className={button.primary}>
                Design my custom set
              </Link>
              <Link href="/shop" className={button.outline}>
                Shop ready-made
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-14 sm:px-6 md:grid-cols-[1.15fr_1fr] md:items-center md:gap-12">
        <div>
          <h2 className="font-serif text-4xl sm:text-5xl">How custom works</h2>
          <ol className="mt-7 flex flex-col gap-5">
            {steps.map((step, i) => (
              <li key={step.title} className="flex gap-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-bubblegum font-semibold">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-semibold">{step.title}</h3>
                  <p className="mt-0.5 leading-relaxed text-cocoa">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <div className="flex flex-col items-center gap-4 rounded-[28px] bg-petal px-6 py-10 text-center">
          <span className="flex items-center gap-2 text-sm font-semibold tracking-[0.12em] uppercase text-cocoa">
            <Sparkle size={12} className="text-heart" /> Follow along
          </span>
          <h2 className="font-serif text-4xl sm:text-5xl">
            New sets on <em>Instagram</em>
          </h2>
          <p className="max-w-xs leading-relaxed text-cocoa">Fresh designs, works in progress and a peek behind the scenes.</p>
          <InstagramButton className="mt-3" />
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 pb-14 sm:px-6">
        <div className="flex items-baseline justify-between">
          <h2 className="font-serif text-4xl sm:text-5xl">Ready to ship</h2>
          <Link href="/shop" className="font-semibold text-heart hover:text-heart-dark">
            See all
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {products.slice(0, 4).map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:px-6 md:grid-cols-[1fr_1.2fr] md:items-center">
          <div className="flex flex-col gap-4">
            <span className="flex items-center gap-2 text-sm font-semibold tracking-[0.12em] uppercase text-cocoa">
              <Sparkle size={12} className="text-heart" /> From moodboard to nails
            </span>
            <h2 className="font-serif text-4xl sm:text-5xl">
              Bring <em>anything</em> that inspires you
            </h2>
            <p className="leading-relaxed text-cocoa">
              Leaves, cherries, your cat, an outfit, a set you saw from another artist — collect it all and I&apos;ll
              turn it into ten tiny paintings. When a set is inspired by someone else&apos;s work, they always get the
              credit.
            </p>
            <Link href="/custom" className={`${button.primary} self-start`}>
              Start with your inspo
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {gallery.slice(0, 6).map((set) => (
              <NailPhoto key={set.slug} src={set.image} alt={set.name} className="rounded-2xl" sizes="(min-width: 768px) 20vw, 33vw" />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-14 sm:px-6">
        <div className="flex items-baseline justify-between">
          <h2 className="font-serif text-4xl sm:text-5xl">From the gallery</h2>
          <Link href="/gallery" className="font-semibold text-heart hover:text-heart-dark">
            View all
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {gallery.slice(4, 8).map((set) => (
            <NailPhoto key={set.slug} src={set.image} alt={set.name} className="rounded-[20px]" />
          ))}
        </div>
      </section>
    </>
  );
}
