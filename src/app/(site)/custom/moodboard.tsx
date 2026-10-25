"use client";

import { useState } from "react";

export type InspirationImage = { id: string; file: File; url: string; credit: string };

const MAX_IMAGES = 10;
const MAX_BYTES = 10 * 1024 * 1024;
// Fixed tilts make the uploads feel like a pinned-up moodboard
const tilts = ["-rotate-3", "rotate-2", "-rotate-1", "rotate-3", "-rotate-2", "rotate-1"];

type Props = {
  images: InspirationImage[];
  onChange: (images: InspirationImage[]) => void;
};

export function Moodboard({ images, onChange }: Props) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addFiles(files: FileList | null) {
    if (!files) return;
    const accepted: InspirationImage[] = [];
    let rejected = 0;
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/") || file.size > MAX_BYTES) {
        rejected++;
        continue;
      }
      if (images.length + accepted.length >= MAX_IMAGES) break;
      accepted.push({ id: crypto.randomUUID(), file, url: URL.createObjectURL(file), credit: "" });
    }
    setError(
      rejected > 0
        ? "Some files were skipped — photos need to be images under 10 MB."
        : images.length + accepted.length >= MAX_IMAGES
          ? `That's the maximum of ${MAX_IMAGES} photos.`
          : null,
    );
    onChange([...images, ...accepted]);
  }

  function remove(id: string) {
    const image = images.find((i) => i.id === id);
    if (image) URL.revokeObjectURL(image.url);
    onChange(images.filter((i) => i.id !== id));
  }

  function setCredit(id: string, credit: string) {
    onChange(images.map((i) => (i.id === id ? { ...i, credit } : i)));
  }

  return (
    <div className="flex flex-col gap-4">
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          addFiles(e.dataTransfer.files);
        }}
        className={`flex cursor-pointer flex-col items-center gap-1 rounded-2xl border-2 border-dashed px-4 py-6 text-center transition-colors ${
          dragging ? "border-heart bg-petal" : "border-[#c9aeb8] bg-white hover:border-heart"
        }`}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="text-heart">
          <rect x="3" y="3" width="18" height="18" rx="4" />
          <circle cx="9" cy="9" r="2" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
        <span className="font-semibold">Add inspiration photos</span>
        <span className="text-sm text-cocoa">Pinterest screenshots, colours, outfits, other nails · up to {MAX_IMAGES}</span>
        <input
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </label>

      {error && (
        <p role="alert" className="text-sm font-medium text-heart">
          {error}
        </p>
      )}

      {images.length > 0 && (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {images.map((image, i) => (
            <li key={image.id} className={`flex flex-col gap-2 rounded-xl bg-white p-2 pb-3 shadow-[0_6px_20px_rgba(74,51,51,0.12)] ${tilts[i % tilts.length]}`}>
              <div className="relative aspect-square overflow-hidden rounded-lg bg-petal">
                {/* Local blob preview — next/image can't optimise these */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image.url} alt={`Inspiration photo ${i + 1}`} className="size-full object-cover" />
                <button
                  type="button"
                  onClick={() => remove(image.id)}
                  aria-label={`Remove photo ${i + 1}`}
                  className="absolute top-1.5 right-1.5 flex size-8 items-center justify-center rounded-full bg-white/90 text-choc hover:bg-white"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </div>
              <input
                type="text"
                value={image.credit}
                onChange={(e) => setCredit(image.id, e.target.value)}
                placeholder="Artist credit, e.g. @name"
                aria-label={`Artist credit for photo ${i + 1} (optional)`}
                className="w-full rounded-full border border-line px-3 py-1.5 text-sm placeholder:text-cocoa/70 focus:border-heart focus:outline-none"
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
