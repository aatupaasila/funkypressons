"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export type Slide = { src: string; alt: string };

const SHOW_FOR_MS = 4500;

// Photos stacked on top of each other; the next one fades in while softly
// settling from a slight blur and zoom. One photo, or reduced motion, stays still.
export function HeroSlideshow({ slides, className = "", sizes }: { slides: Slide[]; className?: string; sizes: string }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (slides.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => setCurrent((i) => (i + 1) % slides.length), SHOW_FOR_MS);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className={`relative aspect-square overflow-hidden bg-white ${className}`}>
      {slides.map((slide, i) => {
        const shown = i === current;
        return (
          <Image
            key={slide.src}
            src={slide.src}
            alt={shown ? slide.alt : ""}
            aria-hidden={!shown}
            fill
            sizes={sizes}
            priority={i === 0}
            className={`object-contain p-[4%] transition-[opacity,scale,filter] duration-[1400ms] ease-in-out ${
              shown ? "scale-100 opacity-100 blur-none" : "scale-[1.04] opacity-0 blur-sm"
            }`}
          />
        );
      })}
    </div>
  );
}
