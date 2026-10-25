import { measureSteps, presetMillimetres, presetSizes, tipWidths, type PresetSize } from "@/content/sizing";

const PX_PER_MM = 3;
const GAP = 7;
const NAIL_HEIGHT = 62;

// Lay the tips out side by side once; the widths never change
const nails = tipWidths.map((mm, tip) => ({
  tip,
  mm,
  w: mm * PX_PER_MM,
  x: tipWidths.slice(0, tip).reduce((sum, prev) => sum + prev * PX_PER_MM + GAP, 0),
}));
const chartWidth = nails[nails.length - 1].x + nails[nails.length - 1].w;

/** Row of tips 0–9 drawn to scale, like the chart she uses */
export function TipChart() {
  const width = chartWidth;
  return (
    <svg viewBox={`0 0 ${width} ${NAIL_HEIGHT + 22}`} className="h-auto w-full" role="img" aria-label="Tip sizes 0 to 9: 18, 16, 15, 14, 13, 12, 11, 10, 9 and 8 millimetres wide">
      {nails.map(({ tip, mm, x, w }) => (
        <g key={tip}>
          <text x={x + w / 2} y={12} textAnchor="middle" fontSize="12" fontWeight="600" fill="#4a3333">
            {tip}
          </text>
          <path
            d={`M${x} ${NAIL_HEIGHT + 22} V${30} Q${x} 20 ${x + 8} 20 H${x + w - 8} Q${x + w} 20 ${x + w} 30 V${NAIL_HEIGHT + 22} Z`}
            fill="#ffe3f0"
            stroke="#4a3333"
            strokeWidth="1.5"
          />
          <line x1={x + 4} x2={x + w - 4} y1={46} y2={46} stroke="#d62a66" strokeWidth="1.5" />
          <text x={x + w / 2} y={62} textAnchor="middle" fontSize="10" fill="#4a3333">
            {mm}
          </text>
          <text x={x + w / 2} y={72} textAnchor="middle" fontSize="7" fill="#7a5c5c">
            mm
          </text>
        </g>
      ))}
    </svg>
  );
}

export function MeasureSteps() {
  return (
    <ol className="flex flex-col gap-3">
      {measureSteps.map((text, i) => (
        <li key={text} className="flex items-start gap-3">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-bubblegum text-sm font-semibold">{i + 1}</span>
          <span className="pt-0.5 leading-relaxed">{text}</span>
        </li>
      ))}
    </ol>
  );
}

export function PresetTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[22rem] text-left text-sm">
        <caption className="sr-only">Standard sizes in millimetres, thumb to pinky</caption>
        <thead>
          <tr className="text-cocoa">
            <th scope="col" className="py-2 pr-3 font-medium">Size</th>
            {["Thumb", "Index", "Middle", "Ring", "Pinky"].map((f) => (
              <th key={f} scope="col" className="px-1 py-2 text-center font-medium">
                {f}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {(Object.keys(presetSizes) as PresetSize[]).map((size) => (
            <tr key={size}>
              <th scope="row" className="py-2.5 pr-3 font-semibold">
                {size}
              </th>
              {presetMillimetres(size).map((mm, i) => (
                <td key={i} className="px-1 py-2.5 text-center">
                  {mm} <span className="text-xs text-cocoa">mm</span>
                  <span className="block text-xs text-cocoa">#{presetSizes[size][i]}</span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** The full guide: how to measure, the tip chart and the standard sizes */
export function SizingGuide() {
  return (
    <div className="flex flex-col gap-6">
      <MeasureSteps />
      <div className="rounded-2xl bg-white p-4">
        <TipChart />
      </div>
      <div>
        <h3 className="mb-1 font-semibold">Standard sizes</h3>
        <p className="mb-2 text-sm text-cocoa">If your measurements match one of these, just pick it. Otherwise send your own sizes.</p>
        <PresetTable />
      </div>
      <p className="text-sm text-cocoa">Measure both hands — they&apos;re often slightly different. Between two sizes? Go for the wider one.</p>
    </div>
  );
}
