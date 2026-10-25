import { Sparkle } from "./sparkle";

export function PageIntro({ eyebrow, title, children }: { eyebrow: string; title: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 pt-10 pb-8 sm:px-6 md:pt-14">
      <span className="flex items-center gap-2 text-sm font-semibold tracking-[0.12em] uppercase text-cocoa">
        <Sparkle size={12} className="text-heart" /> {eyebrow}
      </span>
      <h1 className="mt-3 font-serif text-5xl leading-none sm:text-6xl">{title}</h1>
      {children && <div className="mt-4 max-w-xl leading-relaxed text-cocoa">{children}</div>}
    </div>
  );
}
