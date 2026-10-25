"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { navLinks } from "@/content/navigation";
import { Sparkle, Wordmark } from "./sparkle";

// Below this many pixels from the top the header always stays full size
const COLLAPSE_AFTER = 80;
// Ignore tiny scroll jitters (trackpads, iOS bounce)
const MIN_DELTA = 6;

function MenuIcon({ open }: { open: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
    </svg>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolledDown, setScrolledDown] = useState(false);
  const [hovered, setHovered] = useState(false);

  // Collapse while scrolling down, expand again as soon as the visitor scrolls up
  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (Math.abs(y - lastY) < MIN_DELTA) return;
      setScrolledDown(y > COLLAPSE_AFTER && y > lastY);
      lastY = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const compact = scrolledDown && !hovered && !open;

  return (
    <>
      <header
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) setHovered(false);
        }}
        className="fixed inset-x-0 top-0 z-40 bg-blush/95 shadow-[0_1px_0_var(--color-line)] backdrop-blur"
      >
        <div className={`grid transition-[grid-template-rows] duration-300 ${compact ? "grid-rows-[0fr]" : "grid-rows-[1fr]"}`}>
          <div className="overflow-hidden" inert={compact}>
            <div className="flex h-9 items-center justify-center bg-matcha px-4 text-[13px] font-medium">
              Shipping worldwide <Sparkle size={10} className="mx-1.5" /> Custom sets open
            </div>
          </div>
        </div>

        <nav
          className={`mx-auto flex max-w-6xl items-center justify-between px-2 transition-[height] duration-300 sm:px-6 ${
            compact ? "h-11" : "h-15"
          }`}
        >
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
            className="flex size-11 items-center justify-center md:hidden"
          >
            <MenuIcon open={open} />
          </button>

          <Link
            href="/"
            className={`text-heart transition-[font-size] duration-300 ${compact ? "text-lg sm:text-xl" : "text-2xl sm:text-[28px]"}`}
          >
            <Wordmark />
          </Link>

          <ul className={`items-center gap-7 ${compact ? "hidden" : "hidden md:flex"}`}>
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={pathname.startsWith(link.href) ? "page" : undefined}
                  className="text-[15px] font-medium underline-offset-8 hover:underline aria-[current=page]:underline"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Desktop, collapsed: stands in for the links. Hovering already expands; this covers touch screens */}
          <button
            type="button"
            aria-label="Show menu"
            onClick={() => setScrolledDown(false)}
            className={`size-11 items-center justify-center ${compact ? "hidden md:flex" : "hidden"}`}
          >
            <MenuIcon open={false} />
          </button>

          {/* Keeps the wordmark centred on mobile; the bag goes here once checkout exists */}
          <span className="size-11 md:hidden" aria-hidden="true" />
        </nav>

        {open && (
          <ul className="border-t border-line bg-blush px-6 pt-2 pb-6 md:hidden">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} onClick={() => setOpen(false)} className="block py-3 font-serif text-3xl">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </header>

      {/* Reserves the full-size header's height (h-9 + h-15) so content never jumps */}
      <div className="h-24 shrink-0" aria-hidden="true" />
    </>
  );
}
