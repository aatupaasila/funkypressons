import Link from "next/link";
import { navLinks } from "@/content/navigation";
import { site } from "@/content/site";
import { Sparkle, Wordmark } from "./sparkle";

export function SiteFooter() {
  return (
    <footer className="bg-matcha">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-10 sm:px-6 md:flex-row md:justify-between">
        <div className="flex flex-col gap-3">
          <span className="flex items-center gap-2 text-3xl">
            <Wordmark /> <Sparkle size={18} />
          </span>
          <p className="max-w-xs text-[15px]">Hand-painted press-on nails, made from your moodboard.</p>
          <a href={site.instagram} className="font-semibold underline underline-offset-4">
            {site.instagramHandle} on Instagram
          </a>
          <a href={`mailto:${site.email}`} className="font-semibold underline underline-offset-4">
            {site.email}
          </a>
        </div>
        <ul className="flex flex-col gap-1 md:items-end">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="inline-block py-1.5 hover:underline">
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <Link href="/privacy" className="inline-block py-1.5 text-sm hover:underline">
              Privacy policy
            </Link>
          </li>
        </ul>
      </div>
    </footer>
  );
}
