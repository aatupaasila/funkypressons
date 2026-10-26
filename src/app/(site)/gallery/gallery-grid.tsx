"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { NailSet } from "@/content/catalog";
import { lengths } from "@/content/order-options";
import { NailPhoto } from "@/components/nail-photo";
import { button, tag } from "@/components/ui";

// The native <dialog> traps focus, closes on Escape and hands focus back to the set that opened it
export function GalleryGrid({ sets }: { sets: NailSet[] }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [active, setActive] = useState<NailSet | null>(null);

  // Open only once the chosen set has rendered, so the previous one never flashes
  useEffect(() => {
    const dialog = dialogRef.current;
    if (active && dialog && !dialog.open) dialog.showModal();
  }, [active]);

  const close = () => dialogRef.current?.close();

  return (
    <>
      <ul className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-x-4 gap-y-6 px-5 pb-16 sm:px-6 md:grid-cols-3 lg:grid-cols-4">
        {sets.map((set) => (
          <li key={set.slug}>
            <button
              type="button"
              aria-haspopup="dialog"
              aria-label={set.name}
              onClick={() => setActive(set)}
              className="group flex w-full flex-col gap-2 rounded-[20px] text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-heart"
            >
              <NailPhoto src={set.image} alt={set.description} className="rounded-[20px] transition-shadow group-hover:shadow-[0_6px_24px_rgba(74,51,51,0.14)]" />
              <span className="font-serif text-xl leading-tight">{set.name}</span>
              {set.inspiredBy && <span className="-mt-1 text-sm text-cocoa italic">Inspired by {set.inspiredBy}</span>}
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        aria-labelledby="gallery-set-name"
        // Covers Escape too; an empty dialog has nothing stale to show next time
        onClose={() => setActive(null)}
        // A click that lands on the dialog itself, not its content, is on the dimmed backdrop
        onClick={(e) => e.target === e.currentTarget && close()}
        className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-3xl overflow-y-auto rounded-[28px] bg-blush p-0 text-choc shadow-[0_20px_60px_rgba(74,51,51,0.25)] backdrop:bg-choc/45 backdrop:backdrop-blur-sm open:animate-step-in"
      >
        {active && (
          <div className="relative grid md:grid-cols-2">
            <NailPhoto src={active.image} alt={active.description} sizes="(min-width: 768px) 384px, 100vw" priority />
            <div className="flex flex-col gap-4 p-6 sm:p-8">
              <div className="flex flex-col gap-1 pr-10 md:pr-8">
                <h2 id="gallery-set-name" className="font-serif text-4xl leading-[1.05]">
                  {active.name}
                </h2>
                {active.inspiredBy && <p className="text-sm text-cocoa italic">Inspired by {active.inspiredBy}</p>}
              </div>
              {active.description && <p className="leading-relaxed">{active.description}</p>}
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-2xl bg-white px-4 py-3">
                  <dt className="text-cocoa">Shape</dt>
                  <dd className="font-semibold capitalize">{active.shape}</dd>
                </div>
                <div className="rounded-2xl bg-white px-4 py-3">
                  <dt className="text-cocoa">Length</dt>
                  <dd className="font-semibold">{lengths.find((l) => l.id === active.length)?.name ?? active.length}</dd>
                </div>
              </dl>
              {active.tags.length > 0 && (
                <ul className="flex flex-wrap gap-2">
                  {active.tags.map((t) => (
                    <li key={t} className={`${tag} bg-petal`}>
                      {t}
                    </li>
                  ))}
                </ul>
              )}
              <Link href="/custom" className={`${button.primary} mt-auto`}>
                Request this set in your sizes
              </Link>
            </div>
            <button
              type="button"
              aria-label="Close"
              onClick={close}
              className="absolute top-3 right-3 flex size-11 items-center justify-center rounded-full bg-white/90 shadow-sm transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-heart"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
        )}
      </dialog>
    </>
  );
}
