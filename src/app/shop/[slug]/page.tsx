import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatPrice, getProduct, products } from "@/content/catalog";
import { NailPhoto } from "@/components/nail-photo";
import { button, tag } from "@/components/ui";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/shop/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  return product ? { title: product.name, description: product.description } : {};
}

export default async function ProductPage({ params }: PageProps<"/shop/[slug]">) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-8 sm:px-6 md:grid-cols-2 md:gap-14 md:py-14">
      <NailPhoto src={product.image} alt={product.name} className="rounded-3xl" sizes="(min-width: 768px) 50vw, 100vw" priority />

      <div className="flex flex-col gap-5">
        <Link href="/shop" className="text-sm font-semibold text-cocoa hover:text-choc">
          ← Back to shop
        </Link>
        <div className="flex flex-wrap gap-2">
          {product.isNew && <span className={`${tag} bg-choc text-white`}>New</span>}
          {product.tags.map((t) => (
            <span key={t} className={`${tag} bg-petal`}>
              {t}
            </span>
          ))}
        </div>
        <h1 className="font-serif text-5xl leading-none">{product.name}</h1>
        <p className="text-xl font-semibold">{formatPrice(product.price)}</p>
        <p className="leading-relaxed">{product.description}</p>
        {product.inspiredBy && <p className="text-sm text-cocoa italic">Inspired by {product.inspiredBy}</p>}

        <dl className="grid grid-cols-2 gap-4 rounded-2xl bg-white p-5 text-sm">
          <div>
            <dt className="text-cocoa">Shape</dt>
            <dd className="font-semibold capitalize">{product.shape}</dd>
          </div>
          <div>
            <dt className="text-cocoa">Length</dt>
            <dd className="font-semibold">{product.length}</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-cocoa">Fit</dt>
            <dd>Made to your measurements after you order.</dd>
          </div>
        </dl>

        {/* Checkout arrives with Stripe; until then the button is honest about it */}
        <button type="button" disabled className={button.primary}>
          {product.inStock ? "Checkout opening soon" : "Sold out"}
        </button>
        <p className="text-sm text-cocoa">
          Want it in another shape or colour?{" "}
          <Link href="/custom" className="font-semibold text-heart underline underline-offset-4">
            Request a custom version
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
