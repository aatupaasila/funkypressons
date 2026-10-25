import type { Metadata } from "next";
import Link from "next/link";
import { getProducts } from "@/sanity/queries";
import { PageIntro } from "@/components/page-intro";
import { ProductCard } from "@/components/product-card";

export const metadata: Metadata = { title: "Shop" };

export default async function ShopPage() {
  const products = await getProducts();
  return (
    <>
      <PageIntro eyebrow="Ready-made sets" title={<>The <em>shop</em></>}>
        Designs I&apos;ve already dreamed up, made to your sizes. Want something of your own?{" "}
        <Link href="/custom" className="font-semibold text-heart underline underline-offset-4">
          Order a custom set
        </Link>
        .
      </PageIntro>
      <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-4 px-5 pb-16 sm:px-6 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
    </>
  );
}
