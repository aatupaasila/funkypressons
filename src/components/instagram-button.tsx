import { site } from "@/content/site";
import { Sparkle } from "./sparkle";

// Instagram's brand rules don't allow animating the glyph itself, so the
// shimmer and the twinkling sparkles happen around it.
const sparkles = [
  { size: 16, className: "-top-3 -left-2 text-heart", delay: "0s" },
  { size: 11, className: "-top-4 right-8 text-matcha", delay: "1.4s" },
  { size: 18, className: "-right-3 -bottom-3 text-heart", delay: "2.8s" },
];

function InstagramGlyph() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.3" cy="6.7" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function InstagramButton({ className = "" }: { className?: string }) {
  return (
    <a
      href={site.instagram}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${site.instagramHandle} on Instagram`}
      className={`group relative inline-flex rounded-full transition-[scale] duration-300 ease-out hover:scale-108 focus-visible:scale-108 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-heart ${className}`}
    >
      <span className="relative inline-flex min-h-14 items-center gap-3 overflow-hidden rounded-full bg-heart px-8 text-lg font-semibold text-white shadow-[0_8px_24px_rgba(214,42,102,0.3)] transition-colors group-hover:bg-heart-dark">
        <InstagramGlyph />
        {site.instagramHandle}
        {/* A glint of light sweeping across now and then */}
        <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 w-1/3 animate-shine bg-linear-to-r from-transparent via-white/45 to-transparent motion-reduce:hidden" />
      </span>
      {sparkles.map((s) => (
        <Sparkle
          key={s.delay}
          size={s.size}
          className={`pointer-events-none absolute animate-twinkle group-hover:[animation-duration:1.4s] motion-reduce:hidden ${s.className}`}
          style={{ animationDelay: s.delay }}
        />
      ))}
    </a>
  );
}
