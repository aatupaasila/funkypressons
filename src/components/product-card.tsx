import Link from "next/link";
import { formatPrice, type Product } from "@/content/catalog";
import { NailPhoto } from "./nail-photo";
import { tag } from "./ui";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/shop/${product.slug}`} className="group flex flex-col gap-2 text-choc">
      <div className="relative">
        <NailPhoto
          src={product.image}
          alt={product.name}
          className="rounded-[20px] transition-transform duration-300 group-hover:-translate-y-1"
        />
        {product.isNew && <span className={`${tag} absolute top-3 left-3 bg-choc text-white`}>New</span>}
        {!product.inStock && (
          <span className={`${tag} absolute top-3 left-3 border border-line bg-white text-cocoa`}>Sold out</span>
        )}
      </div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-serif text-xl leading-tight sm:text-2xl">{product.name}</span>
        <span className="shrink-0 text-sm font-semibold">{formatPrice(product.price)}</span>
      </div>
      <span className="-mt-1 text-sm text-cocoa capitalize">
        {product.shape} · {product.length}
      </span>
    </Link>
  );
}
