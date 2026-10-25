// Shared class strings so buttons look the same whether they're <a> or <button>.

const base =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-7 text-base font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-heart disabled:cursor-not-allowed";

export const button = {
  primary: `${base} bg-heart text-white hover:bg-heart-dark disabled:bg-[#c9aeb8]`,
  outline: `${base} border-2 border-choc text-choc hover:bg-choc hover:text-white`,
  matcha: `${base} bg-matcha text-choc hover:bg-[#b3c873]`,
};

export const tag = "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold";
