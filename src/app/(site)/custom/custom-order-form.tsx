"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore, useTransition } from "react";
import { fingers, lengths, setTypes, type ShapeOption } from "@/content/order-options";
import { site } from "@/content/site";
import { nearestTip, presetMillimetres, presetSizes, type PresetSize } from "@/content/sizing";
import { SizingGuide } from "@/components/sizing-guide";
import { Sparkle } from "@/components/sparkle";
import { button } from "@/components/ui";
import { submitCustomOrder } from "./actions";
import { Moodboard, type InspirationImage } from "./moodboard";
import { emptyDraft, isValidEmail, isValidSize, sizesComplete, validateOrder, type Hand, type OrderDraft } from "./order";
import { uploadInspirationPhoto } from "./upload-photo";

type StepId = "type" | "inspiration" | "design" | "shape" | "length" | "colour" | "sizes" | "deadline" | "contact" | "review";
type Design = { slug: string; name: string; image: string };
/** Lists she edits in Site settings */
export type FormOptions = { shippingCountries: string[]; baseColours: { id: string; name: string; hex: string }[]; shapes: ShapeOption[] };
type FormProps = { designs: Design[]; options: FormOptions };

const DRAFT_KEY = "fpo-custom-draft-v1";

// Shape boxes per row, by how many shapes are on offer (gap-3 is 0.75rem)
const shapeWidth = {
  1: "w-full sm:max-w-sm",
  2: "basis-[calc((100%_-_0.75rem)/2)]",
  3: "basis-[calc((100%_-_1.5rem)/3)]",
} as const;

const inputClass =
  "w-full rounded-full border-[1.5px] border-choc bg-white px-5 py-3 text-base placeholder:text-cocoa/70 focus:border-heart focus:outline-none";

function stepsFor(draft: OrderDraft): StepId[] {
  const steps: StepId[] = ["type", draft.setType === "existing" ? "design" : "inspiration", "shape", "length"];
  // A past design already has its colours
  if (draft.setType !== "existing") steps.push("colour");
  steps.push("sizes", "deadline", "contact", "review");
  return steps;
}

function readSavedDraft(): { draft: OrderDraft; step: number } {
  try {
    const saved = JSON.parse(localStorage.getItem(DRAFT_KEY) ?? "null");
    if (saved?.draft) return { draft: { ...emptyDraft, ...saved.draft }, step: saved.step ?? 0 };
  } catch {
    // Storage unavailable or corrupt — start fresh
  }
  return { draft: emptyDraft, step: 0 };
}

const noopSubscribe = () => () => {};

// The saved draft lives in localStorage, so the form itself only mounts in the browser
export function CustomOrderForm(props: FormProps) {
  const inBrowser = useSyncExternalStore(noopSubscribe, () => true, () => false);
  if (!inBrowser) return <div className="flex-1" aria-busy="true" />;
  return <OrderForm {...props} />;
}

function OrderForm({ designs, options }: FormProps) {
  const [saved] = useState(readSavedDraft);
  const [draft, setDraft] = useState<OrderDraft>(saved.draft);
  const [stepIndex, setStepIndex] = useState(saved.step);
  const [images, setImages] = useState<InspirationImage[]>([]);
  const [problems, setProblems] = useState<string[]>([]);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const [sending, startSending] = useTransition();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const navigated = useRef(false);
  const uploaded = useRef(new Map<string, string>());
  const honeypotRef = useRef<HTMLInputElement>(null);

  const steps = stepsFor(draft);
  const index = Math.min(stepIndex, steps.length - 1);
  const step = steps[index];
  const isLast = index === steps.length - 1;

  // Answers are saved as you go; photos can't be stored, only answers
  useEffect(() => {
    if (reference) return;
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ draft, step: index }));
    } catch {}
  }, [draft, index, reference]);

  // Move focus to the new question so screen readers and keyboards follow along
  useEffect(() => {
    if (!navigated.current) return;
    headingRef.current?.focus();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [index]);

  // Free the photo previews when leaving the page
  const imagesRef = useRef(images);
  useEffect(() => {
    imagesRef.current = images;
  }, [images]);
  useEffect(() => () => imagesRef.current.forEach((i) => URL.revokeObjectURL(i.url)), []);

  function update(patch: Partial<OrderDraft>) {
    setDraft((d) => ({ ...d, ...patch }));
  }

  function goTo(id: StepId) {
    navigated.current = true;
    setStepIndex(steps.indexOf(id));
  }

  function back() {
    navigated.current = true;
    setStepIndex(Math.max(0, index - 1));
  }

  const canContinue: Record<StepId, boolean> = {
    type: draft.setType !== null,
    inspiration: draft.setType === "artists-choice" || draft.vision.trim() !== "" || images.length > 0,
    design: draft.existingDesign !== null,
    shape: draft.shape === "artist" || options.shapes.some((s) => s.id === draft.shape),
    length: draft.length !== null,
    colour: draft.baseColour !== null,
    sizes: sizesComplete(draft),
    deadline: true,
    contact: options.shippingCountries.includes(draft.country) && draft.name.trim() !== "" && isValidEmail(draft.email),
    review: draft.agreed,
  };

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canContinue[step]) return;
    if (!isLast) {
      navigated.current = true;
      setStepIndex(index + 1);
      return;
    }
    const localProblems = validateOrder(draft, images.length, options);
    if (localProblems.length) return setProblems(localProblems);

    startSending(async () => {
      // Photos go up one by one first; the request then points at them
      const uploads = [];
      try {
        for (const [i, image] of images.entries()) {
          setUploadStatus(`Sending photo ${i + 1} of ${images.length}…`);
          // Remember finished uploads so a retry doesn't send the same photo twice
          const assetId = uploaded.current.get(image.id) ?? (await uploadInspirationPhoto(image.file));
          uploaded.current.set(image.id, assetId);
          uploads.push({ assetId, credit: image.credit });
        }
      } catch (error) {
        setUploadStatus(null);
        return setProblems([error instanceof Error ? error.message : "Uploading a photo failed. Please try again."]);
      }
      setUploadStatus("Sending your request…");
      const result = await submitCustomOrder(draft, uploads, honeypotRef.current?.value ?? "");
      setUploadStatus(null);
      if (!result.ok) return setProblems(result.problems);
      setProblems([]);
      setReference(result.reference);
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch {}
    });
  }

  if (reference) {
    return (
      <div className="mx-auto flex w-full max-w-xl flex-1 animate-step-in flex-col items-center justify-center gap-5 px-5 py-16 text-center">
        <Sparkle size={44} className="text-heart" />
        <h1 className="font-serif text-5xl leading-none">
          Request <em>sent!</em>
        </h1>
        <p className="text-lg leading-relaxed">
          Thank you, {draft.name.split(" ")[0]}. I&apos;ll look at your idea and email you at{" "}
          <strong className="font-semibold">{draft.email}</strong> with a personal quote.
        </p>
        <p className="text-sm text-cocoa">
          Your reference: <strong className="font-semibold text-choc">{reference}</strong>
          <br />
          The quote comes from {site.email} — keep an eye on your spam folder too.
        </p>
        <Link href="/gallery" className={button.outline}>
          Browse the gallery meanwhile
        </Link>
      </div>
    );
  }

  const progress = ((index + 1) / steps.length) * 100;

  return (
    <form onSubmit={handleSubmit} className="flex flex-1 flex-col" noValidate>
      {/* Spam trap: hidden from people and screen readers, filled in by bots */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Website
          <input ref={honeypotRef} type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>
      <div className="mx-auto w-full max-w-2xl px-5 pt-6 sm:px-6">
        <div className="flex items-center justify-between text-sm font-semibold text-cocoa">
          <span className="tracking-[0.12em] uppercase">Your custom set</span>
          <span>
            {index + 1}/{steps.length}
          </span>
        </div>
        <div
          role="progressbar"
          aria-label={`Step ${index + 1} of ${steps.length}`}
          aria-valuemin={1}
          aria-valuemax={steps.length}
          aria-valuenow={index + 1}
          className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#f3dce5]"
        >
          <div className="h-full rounded-full bg-heart transition-[width] duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div key={step} className="mx-auto w-full max-w-2xl flex-1 animate-step-in px-5 pt-8 pb-10 sm:px-6">
        <StepContent
          step={step}
          draft={draft}
          update={update}
          images={images}
          setImages={setImages}
          designs={designs}
          options={options}
          headingRef={headingRef}
          goTo={goTo}
        />
        {isLast && problems.length > 0 && (
          <ul role="alert" className="mt-6 list-disc rounded-2xl bg-petal py-4 pr-4 pl-9 text-sm font-medium">
            {problems.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="sticky bottom-0 z-30 border-t border-line bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-2xl gap-3 px-5 py-3.5 sm:px-6">
          {index > 0 && (
            <button type="button" onClick={back} className={button.outline}>
              Back
            </button>
          )}
          <button type="submit" disabled={!canContinue[step] || sending} className={`${button.primary} flex-1`}>
            {isLast ? (sending ? (uploadStatus ?? "Sending…") : "Send my request") : "Continue"}
          </button>
        </div>
      </div>
    </form>
  );
}

type StepProps = {
  step: StepId;
  draft: OrderDraft;
  update: (patch: Partial<OrderDraft>) => void;
  images: InspirationImage[];
  setImages: (images: InspirationImage[]) => void;
  designs: Design[];
  options: FormOptions;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  goTo: (id: StepId) => void;
};

function Question({ title, hint, headingRef }: { title: React.ReactNode; hint?: React.ReactNode; headingRef: StepProps["headingRef"] }) {
  return (
    <div className="mb-6 flex flex-col gap-2">
      <h1 ref={headingRef} tabIndex={-1} className="font-serif text-4xl leading-[1.05] outline-none sm:text-5xl">
        {title}
      </h1>
      {hint && <p className="leading-relaxed text-cocoa">{hint}</p>}
    </div>
  );
}

function Choice({ selected, onSelect, className = "", children }: { selected: boolean; onSelect: () => void; className?: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={`rounded-2xl border-2 text-choc transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-heart ${
        selected ? "border-heart bg-petal" : "border-line bg-white hover:border-[#e5a9c2]"
      } ${className}`}
    >
      {children}
    </button>
  );
}

function StepContent({ step, draft, update, images, setImages, designs, options, headingRef, goTo }: StepProps) {
  const { baseColours, shippingCountries, shapes } = options;
  switch (step) {
    case "type":
      return (
        <>
          <Question headingRef={headingRef} title={<>What kind of set are you <em>dreaming of?</em></>} />
          <div className="grid gap-3">
            {setTypes.map((t) => (
              <Choice key={t.id} selected={draft.setType === t.id} onSelect={() => update({ setType: t.id })} className="flex flex-col gap-1 px-5 py-4 text-left">
                <span className="text-lg font-semibold">{t.title}</span>
                <span className="text-sm text-cocoa">{t.description}</span>
              </Choice>
            ))}
          </div>
        </>
      );

    case "inspiration": {
      const titles = {
        "own-idea": <>Tell me your <em>idea</em></>,
        inspired: <>Show me your <em>inspiration</em></>,
        "artists-choice": <>Any <em>vibes</em> to start from?</>,
      };
      return (
        <>
          <Question
            headingRef={headingRef}
            title={titles[draft.setType as keyof typeof titles] ?? titles.inspired}
            hint={
              draft.setType === "artists-choice"
                ? "Totally optional — a colour, a mood or a word is plenty."
                : "Photos, Pinterest screenshots, colours, other artists' nails — whatever you love. If a photo is someone else's work, add their name so they get credit."
            }
          />
          <div className="flex flex-col gap-6">
            <Moodboard images={images} onChange={setImages} />
            <label className="flex flex-col gap-2 font-semibold">
              Describe your vision
              <textarea
                value={draft.vision}
                onChange={(e) => update({ vision: e.target.value })}
                rows={4}
                placeholder="Colours, details, the feeling you're going for…"
                className="rounded-2xl border-[1.5px] border-choc bg-white px-5 py-3 font-normal placeholder:text-cocoa/70 focus:border-heart focus:outline-none"
              />
            </label>
            <p className="text-sm text-cocoa">Photos aren&apos;t saved if you leave the page — your answers are.</p>
          </div>
        </>
      );
    }

    case "design":
      return (
        <>
          <Question headingRef={headingRef} title={<>Which design would you <em>like?</em></>} hint="I'll remake it to your sizes and chosen shape." />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {designs.map((d) => (
              <Choice key={d.slug} selected={draft.existingDesign === d.slug} onSelect={() => update({ existingDesign: d.slug })} className="flex flex-col gap-2 p-2 pb-3 text-left">
                <span className="relative block aspect-square overflow-hidden rounded-xl bg-white">
                  <Image src={d.image} alt="" fill sizes="(min-width: 640px) 200px, 45vw" className="object-contain p-[4%]" />
                </span>
                <span className="px-1 font-serif text-lg leading-tight">{d.name}</span>
              </Choice>
            ))}
          </div>
        </>
      );

    case "shape": {
      // Fewer shapes get bigger boxes; four sit as 2×2, five leave a centred last row
      const perRow = shapes.length === 4 ? 2 : (Math.min(shapes.length, 3) as 1 | 2 | 3);
      const large = perRow < 3;
      return (
        <>
          <Question headingRef={headingRef} title={<>Pick your <em>shape</em></>} hint="Shape doesn't change the price — choose what feels most like you." />
          {shapes.length > 0 && (
            <div className="flex flex-wrap justify-center gap-3">
              {shapes.map((s) => {
                const on = draft.shape === s.id;
                return (
                  <Choice
                    key={s.id}
                    selected={on}
                    onSelect={() => update({ shape: s.id })}
                    className={`flex flex-col items-center gap-2 ${shapeWidth[perRow]} ${large ? "min-h-48 px-4 pt-7 pb-5" : "min-h-33 px-2 pt-4 pb-3"}`}
                  >
                    <svg width={large ? 60 : 40} height={large ? 100 : 66} viewBox="0 0 60 100" aria-hidden="true">
                      <path d={s.path} fill={on ? "#ffb3d9" : "#fff7fa"} stroke="#4a3333" strokeWidth="2.5" strokeLinejoin="round" />
                    </svg>
                    <span className={`font-semibold ${large ? "text-lg" : "text-sm"}`}>{s.name}</span>
                    {s.note && <span className="text-xs leading-snug text-cocoa">{s.note}</span>}
                  </Choice>
                );
              })}
            </div>
          )}
          <Choice
            selected={draft.shape === "artist"}
            onSelect={() => update({ shape: "artist" })}
            className={`min-h-13 w-full border-dashed font-medium ${shapes.length > 0 ? "mt-3" : ""}`}
          >
            <Sparkle size={12} className="mr-1.5 inline -translate-y-px text-heart" /> Not sure — artist&apos;s choice
          </Choice>
        </>
      );
    }

    case "length":
      return (
        <>
          <Question headingRef={headingRef} title={<>How <em>long?</em></>} hint="Length doesn't change the price either." />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {lengths.map((l) => {
              const on = draft.length === l.id;
              return (
                <Choice key={l.id} selected={on} onSelect={() => update({ length: l.id })} className="flex flex-col items-center gap-2 px-3 pt-4 pb-3">
                  <span className="flex h-24 items-end" aria-hidden="true">
                    <svg width="34" height={l.height} viewBox={`0 0 34 ${l.height}`}>
                      <path
                        d={`M4 ${l.height} L4 ${l.height * 0.45} Q5 4 17 2 Q29 4 30 ${l.height * 0.45} L30 ${l.height} Z`}
                        fill={on ? "#ffb3d9" : "#fff7fa"}
                        stroke="#4a3333"
                        strokeWidth="2"
                      />
                    </svg>
                  </span>
                  <span className="font-semibold">
                    {l.id} · {l.name}
                  </span>
                  <span className="text-center text-xs text-cocoa">{l.hint}</span>
                </Choice>
              );
            })}
          </div>
        </>
      );

    case "colour":
      return (
        <>
          <Question headingRef={headingRef} title={<>Choose a base <em>colour</em></>} hint="The colour underneath the art. Clear gives a sheer, glass-like look." />
          <div className="grid grid-cols-3 gap-3">
            {baseColours.map((c) => (
              <Choice key={c.id} selected={draft.baseColour === c.id} onSelect={() => update({ baseColour: c.id })} className="flex flex-col items-center gap-2 px-2 pt-4 pb-3">
                <span className="size-12 rounded-full border border-black/10" style={{ background: c.hex }} aria-hidden="true" />
                <span className="text-sm font-semibold">{c.name}</span>
              </Choice>
            ))}
          </div>
          <Choice selected={draft.baseColour === "design"} onSelect={() => update({ baseColour: "design" })} className="mt-3 min-h-13 w-full border-dashed font-medium">
            <Sparkle size={12} className="mr-1.5 inline -translate-y-px text-heart" /> Let the design decide
          </Choice>
        </>
      );

    case "sizes": {
      const setSize = (hand: "left" | "right", i: number, value: string) => {
        const next = [...draft.sizes[hand]] as Hand;
        next[i] = value;
        update({ sizes: { ...draft.sizes, [hand]: next } });
      };
      return (
        <>
          <Question headingRef={headingRef} title={<>Your nail <em>sizes</em></>} hint="Pick a standard size or send your own measurements." />
          <details className="group mb-6 rounded-2xl bg-petal">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 font-semibold">
              <span className="flex items-center gap-2">
                <Sparkle size={12} className="text-heart" /> How to measure your nails
              </span>
              <span aria-hidden="true" className="text-2xl leading-none text-heart transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <div className="px-5 pb-5">
              <SizingGuide />
            </div>
          </details>
          <div className="grid gap-3 sm:grid-cols-3">
            {(
              [
                { mode: "preset", title: "Standard size", text: "XS, S, M or L" },
                { mode: "measured", title: "My own sizes", text: "Width in mm per nail" },
                { mode: "kit", title: "Sizing kit first", text: "I'll make the set once you've sized" },
              ] as const
            ).map((option) => (
              <Choice key={option.mode} selected={draft.sizeMode === option.mode} onSelect={() => update({ sizeMode: option.mode })} className="px-5 py-4 text-left">
                <span className="font-semibold">{option.title}</span>
                <span className="block text-sm text-cocoa">{option.text}</span>
              </Choice>
            ))}
          </div>
          {draft.sizeMode === "preset" && (
            <fieldset className="mt-6">
              <legend className="mb-3 font-semibold">Which size? <span className="font-normal text-cocoa">(mm, thumb to pinky)</span></legend>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {(Object.keys(presetSizes) as PresetSize[]).map((size) => (
                  <Choice key={size} selected={draft.presetSize === size} onSelect={() => update({ presetSize: size })} className="flex flex-col items-center gap-1 px-3 py-4">
                    <span className="font-serif text-3xl leading-none">{size}</span>
                    <span className="text-xs text-cocoa">{presetMillimetres(size).join(" · ")}</span>
                  </Choice>
                ))}
              </div>
            </fieldset>
          )}
          {draft.sizeMode === "measured" && (
            <div className="mt-6 flex flex-col gap-5">
              {(["left", "right"] as const).map((hand) => (
                <fieldset key={hand} className="rounded-2xl bg-white p-4">
                  <legend className="sr-only">{hand === "left" ? "Left hand" : "Right hand"}</legend>
                  <div className="mb-3 flex items-center justify-between">
                    <span aria-hidden="true" className="font-semibold capitalize">
                      {hand} hand
                    </span>
                    {hand === "right" && (
                      <button
                        type="button"
                        onClick={() => update({ sizes: { ...draft.sizes, right: [...draft.sizes.left] as Hand } })}
                        className="text-sm font-semibold text-heart hover:text-heart-dark"
                      >
                        Same as left
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {fingers.map((finger, i) => {
                      const value = draft.sizes[hand][i];
                      const valid = isValidSize(value);
                      const invalid = value !== "" && !valid;
                      return (
                        <label key={finger} className="flex flex-col items-center gap-1 text-xs text-cocoa">
                          {finger}
                          <input
                            inputMode="decimal"
                            value={value}
                            onChange={(e) => setSize(hand, i, e.target.value)}
                            aria-invalid={invalid}
                            aria-label={`${hand} ${finger} width in mm`}
                            placeholder="mm"
                            className={`w-full rounded-xl border-[1.5px] bg-blush px-1 py-2.5 text-center text-base text-choc focus:border-heart focus:outline-none ${
                              invalid ? "border-heart" : "border-line"
                            }`}
                          />
                          {/* Which of her numbered tips this width maps to */}
                          <span className="h-4" aria-hidden="true">
                            {valid && `#${nearestTip(Number(value.replace(",", ".")))}`}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
              ))}
              <p className="text-sm text-cocoa">Most nails are between 8 and 18 mm. The # under each box is the matching tip size.</p>
            </div>
          )}
        </>
      );
    }

    case "deadline":
      return (
        <>
          <Question
            headingRef={headingRef}
            title={<>Need them by a certain <em>date?</em></>}
            hint="Optional — leave it empty if there's no rush. I'll confirm if the date is possible."
          />
          <label className="flex flex-col gap-2 font-semibold">
            Needed by
            <input type="date" value={draft.deadline} onChange={(e) => update({ deadline: e.target.value })} className={`${inputClass} font-normal`} />
          </label>
        </>
      );

    case "contact":
      return (
        <>
          <Question headingRef={headingRef} title={<>Where should it <em>go?</em></>} hint="Your quote comes by email — no payment yet." />
          <div className="flex flex-col gap-5">
            <label className="flex flex-col gap-2 font-semibold">
              Ship to
              <select value={draft.country} onChange={(e) => update({ country: e.target.value })} className={`${inputClass} appearance-none font-normal`}>
                <option value="" disabled>
                  Choose a country
                </option>
                {shippingCountries.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <span className="text-sm font-normal text-cocoa">Shipping to other EU countries is paused for now.</span>
            </label>
            <label className="flex flex-col gap-2 font-semibold">
              Your name
              <input value={draft.name} onChange={(e) => update({ name: e.target.value })} autoComplete="name" className={`${inputClass} font-normal`} />
            </label>
            <label className="flex flex-col gap-2 font-semibold">
              Email
              <input type="email" value={draft.email} onChange={(e) => update({ email: e.target.value })} autoComplete="email" placeholder="you@example.com" className={`${inputClass} font-normal`} />
            </label>
            <label className="flex flex-col gap-2 font-semibold">
              Instagram <span className="-mt-1 text-sm font-normal text-cocoa">Optional</span>
              <input value={draft.instagram} onChange={(e) => update({ instagram: e.target.value })} placeholder="@yourhandle" className={`${inputClass} font-normal`} />
            </label>
            <label className="flex flex-col gap-2 font-semibold">
              Did a friend recommend me? <span className="-mt-1 text-sm font-normal text-cocoa">Optional — their name</span>
              <input value={draft.referral} onChange={(e) => update({ referral: e.target.value })} className={`${inputClass} font-normal`} />
            </label>
          </div>
        </>
      );

    case "review": {
      const setType = setTypes.find((t) => t.id === draft.setType);
      const rows: { label: string; value: string; step: StepId }[] = [
        { label: "Set", value: setType?.title ?? "—", step: "type" },
        draft.setType === "existing"
          ? { label: "Design", value: designs.find((d) => d.slug === draft.existingDesign)?.name ?? "—", step: "design" }
          : {
              label: "Inspiration",
              value: [images.length ? `${images.length} photo${images.length > 1 ? "s" : ""}` : "", draft.vision.trim() ? "description" : ""].filter(Boolean).join(" + ") || "Artist's choice",
              step: "inspiration",
            },
        { label: "Shape", value: draft.shape === "artist" ? "Artist's choice" : (shapes.find((s) => s.id === draft.shape)?.name ?? "—"), step: "shape" },
        { label: "Length", value: lengths.find((l) => l.id === draft.length)?.name ?? "—", step: "length" },
        ...(draft.setType !== "existing"
          ? [{ label: "Base colour", value: draft.baseColour === "design" ? "Design decides" : (baseColours.find((c) => c.id === draft.baseColour)?.name ?? "—"), step: "colour" as const }]
          : []),
        {
          label: "Sizes",
          value:
            draft.sizeMode === "kit"
              ? "Sizing kit first"
              : draft.sizeMode === "preset" && draft.presetSize
                ? `${draft.presetSize} (${presetMillimetres(draft.presetSize).join("/")} mm)`
                : `L ${draft.sizes.left.join("/")} · R ${draft.sizes.right.join("/")} mm`,
          step: "sizes",
        },
        ...(draft.deadline ? [{ label: "Needed by", value: draft.deadline, step: "deadline" as const }] : []),
        { label: "Ship to", value: draft.country, step: "contact" },
        { label: "Contact", value: `${draft.name} · ${draft.email}`, step: "contact" },
      ];
      return (
        <>
          <Question headingRef={headingRef} title={<>Check &amp; <em>send</em></>} hint="Nothing is charged now — you'll get a personal quote by email first." />
          <dl className="divide-y divide-line rounded-2xl bg-white px-5">
            {rows.map((row) => (
              <div key={row.label} className="flex items-baseline gap-4 py-3">
                <dt className="w-28 shrink-0 text-sm text-cocoa">{row.label}</dt>
                <dd className="min-w-0 flex-1 break-words">{row.value}</dd>
                <button type="button" onClick={() => goTo(row.step)} className="text-sm font-semibold text-heart hover:text-heart-dark" aria-label={`Edit ${row.label.toLowerCase()}`}>
                  Edit
                </button>
              </div>
            ))}
          </dl>
          <label className="mt-6 flex cursor-pointer gap-3 rounded-2xl bg-white p-5">
            <input type="checkbox" checked={draft.agreed} onChange={(e) => update({ agreed: e.target.checked })} className="mt-1 size-5 shrink-0 accent-heart" />
            <span className="text-sm leading-relaxed">
              I understand that my order is confirmed only after payment, that I&apos;ve measured my nails following the guide (or asked for a
              sizing kit), and that custom sets can&apos;t be returned. I&apos;ve read the{" "}
              <Link href="/privacy" target="_blank" className="font-semibold text-heart underline underline-offset-4">
                privacy policy
              </Link>
              .
            </span>
          </label>
        </>
      );
    }
  }
}
