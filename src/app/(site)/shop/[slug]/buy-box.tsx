"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { fingers } from "@/content/order-options";
import { presetMillimetres, presetSizes, type PresetSize } from "@/content/sizing";
import { button } from "@/components/ui";
import { isValidSize, type Hand } from "../../custom/order";
import { startCheckout } from "./actions";

type Country = { code: string; name: string; price: number; delivery: string };
type Props = {
  slug: string;
  price: number;
  fulfilment: "made-to-order" | "ready-made";
  readySize?: string;
  countries: Country[];
};

const empty: Hand = ["", "", "", "", ""];
const pill = (on: boolean) =>
  `rounded-2xl border-2 px-4 py-3 text-left transition-colors ${on ? "border-heart bg-petal" : "border-line bg-white hover:border-[#e5a9c2]"}`;

export function BuyBox({ slug, price, fulfilment, readySize, countries }: Props) {
  const [mode, setMode] = useState<"preset" | "measured">("preset");
  const [preset, setPreset] = useState<PresetSize | null>(null);
  const [sizes, setSizes] = useState({ left: empty, right: empty });
  const [country, setCountry] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const shipping = countries.find((c) => c.code === country);
  const madeToOrder = fulfilment === "made-to-order";
  const sizeReady = !madeToOrder || (mode === "preset" ? preset !== null : [...sizes.left, ...sizes.right].every(isValidSize));
  const canBuy = sizeReady && shipping !== undefined && !pending;

  function setSize(hand: "left" | "right", i: number, value: string) {
    setSizes((s) => {
      const next = [...s[hand]] as Hand;
      next[i] = value;
      return { ...s, [hand]: next };
    });
  }

  function buy() {
    setError(null);
    startTransition(async () => {
      const result = await startCheckout({ slug, country, size: { mode, preset, left: sizes.left, right: sizes.right } });
      if (result.ok) window.location.assign(result.url);
      else setError(result.error);
    });
  }

  return (
    <div className="flex flex-col gap-5 rounded-3xl bg-white p-5">
      {madeToOrder ? (
        <fieldset className="flex flex-col gap-3">
          <legend className="mb-1 flex w-full items-baseline justify-between font-semibold">
            Your size
            <Link href="/faq#sizing" target="_blank" className="text-sm font-semibold text-heart underline underline-offset-4">
              How to measure
            </Link>
          </legend>
          <div className="grid grid-cols-4 gap-2">
            {(Object.keys(presetSizes) as PresetSize[]).map((size) => (
              <button
                key={size}
                type="button"
                aria-pressed={mode === "preset" && preset === size}
                onClick={() => {
                  setMode("preset");
                  setPreset(size);
                }}
                className={`${pill(mode === "preset" && preset === size)} flex flex-col items-center gap-0.5 px-1 text-center`}
              >
                <span className="font-serif text-2xl leading-none">{size}</span>
                <span className="text-[11px] text-cocoa">{presetMillimetres(size).join("·")}</span>
              </button>
            ))}
          </div>
          <button type="button" aria-pressed={mode === "measured"} onClick={() => setMode("measured")} className={pill(mode === "measured")}>
            <span className="font-semibold">My own sizes</span>
            <span className="block text-sm text-cocoa">Width in mm for each nail</span>
          </button>
          {mode === "measured" &&
            (["left", "right"] as const).map((hand) => (
              <div key={hand} className="flex flex-col gap-1.5">
                <span className="text-sm font-semibold capitalize">{hand} hand</span>
                <div className="grid grid-cols-5 gap-2">
                  {fingers.map((finger, i) => (
                    <label key={finger} className="flex flex-col items-center gap-1 text-xs text-cocoa">
                      {finger}
                      <input
                        inputMode="decimal"
                        placeholder="mm"
                        value={sizes[hand][i]}
                        onChange={(e) => setSize(hand, i, e.target.value)}
                        aria-label={`${hand} ${finger} width in mm`}
                        className="w-full rounded-xl border-[1.5px] border-line bg-blush px-1 py-2.5 text-center text-base text-choc focus:border-heart focus:outline-none"
                      />
                    </label>
                  ))}
                </div>
              </div>
            ))}
        </fieldset>
      ) : (
        <p className="rounded-2xl bg-petal px-4 py-3 text-sm">
          <strong className="font-semibold">One of a kind:</strong> this exact set is ready to ship
          {readySize ? (
            <>
              {" "}
              in size <strong className="font-semibold">{readySize}</strong>
            </>
          ) : null}
          .
        </p>
      )}

      <label className="flex flex-col gap-2 font-semibold">
        Ship to
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="w-full appearance-none rounded-full border-[1.5px] border-choc bg-white px-5 py-3 font-normal focus:border-heart focus:outline-none"
        >
          <option value="" disabled>
            Choose a country
          </option>
          {countries.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </select>
        {shipping && (
          <span className="text-sm font-normal text-cocoa">
            Shipping {shipping.price === 0 ? "free" : `${shipping.price} €`}
            {shipping.delivery ? ` · ${shipping.delivery}` : ""}
          </span>
        )}
      </label>

      {error && (
        <p role="alert" className="text-sm font-medium text-heart">
          {error}
        </p>
      )}

      <button type="button" onClick={buy} disabled={!canBuy} className={button.primary}>
        {pending ? "Opening checkout…" : shipping ? `Buy · ${price + shipping.price} € total` : "Buy"}
      </button>
      <p className="-mt-2 text-center text-xs text-cocoa">Secure payment by Stripe · cards, Apple Pay, Google Pay, MobilePay</p>
    </div>
  );
}
