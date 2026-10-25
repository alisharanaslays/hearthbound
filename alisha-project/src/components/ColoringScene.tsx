import type { KeyboardEvent } from "react";

export const COLORS = [
  { id: "paper", name: "Paper", hex: "#fffdf8" },
  { id: "lavender", name: "Lavender", hex: "#cdb7e8" },
  { id: "pink", name: "Pink", hex: "#f3b6c8" },
  { id: "sage", name: "Sage", hex: "#a9c9a8" },
  { id: "blue", name: "Blue", hex: "#a9c7e8" },
  { id: "gold", name: "Gold", hex: "#e6c36a" },
  { id: "coral", name: "Coral", hex: "#e89b7a" },
  { id: "ink", name: "Ink", hex: "#3e4a68" },
] as const;

export const REGIONS = [
  { id: "sky", label: "Sky" },
  { id: "moon", label: "Moon" },
  { id: "hill", label: "Far hill" },
  { id: "ground", label: "Ground" },
  { id: "leaves", label: "Leaves" },
  { id: "trunk", label: "Tree trunk" },
  { id: "fox", label: "Fox" },
  { id: "book", label: "Book" },
  { id: "lantern", label: "Lantern" },
  { id: "flower", label: "Flower" },
] as const;

export function fillFor(colors: Record<string, string>, id: string) {
  return colors[id] ?? "#fffdf8";
}

export function ColoringScene({
  colors,
  onPaint,
}: {
  colors: Record<string, string>;
  onPaint?: (id: string) => void;
}) {
  const paint = (id: string) => onPaint?.(id);
  const interactive = Boolean(onPaint);
  const region = (id: string, label: string) =>
    interactive
      ? {
          role: "button" as const,
          tabIndex: 0,
          "aria-label": `Color the ${label}`,
          onClick: () => paint(id),
          onKeyDown: (event: KeyboardEvent<SVGGElement>) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              paint(id);
            }
          },
          style: { cursor: "pointer" },
        }
      : {};

  const stroke = "#2a2420";

  return (
    <svg viewBox="0 0 400 520" aria-label={interactive ? undefined : "A colored page of a fox reading under a tree"}>
      {interactive ? <title>A fox reading under a tree</title> : null}
      <g {...region("sky", "sky")}>
        <rect x="16" y="16" width="368" height="250" rx="18" fill={fillFor(colors, "sky")} stroke={stroke} strokeWidth="3" />
      </g>
      <g {...region("moon", "moon")}>
        <circle cx="312" cy="78" r="32" fill={fillFor(colors, "moon")} stroke={stroke} strokeWidth="3" />
      </g>
      <g {...region("hill", "far hill")}>
        <path d="M16 250c50-70 110-40 160-70 60-30 120 10 208 20v70H16z" fill={fillFor(colors, "hill")} stroke={stroke} strokeWidth="3" />
      </g>
      <g {...region("ground", "ground")}>
        <path d="M16 330c70-50 120 20 190-10 50-20 110 10 178-20v200H16z" fill={fillFor(colors, "ground")} stroke={stroke} strokeWidth="3" />
      </g>
      <g {...region("trunk", "tree trunk")}>
        <rect x="78" y="210" width="28" height="150" rx="6" fill={fillFor(colors, "trunk")} stroke={stroke} strokeWidth="3" />
      </g>
      <g {...region("leaves", "leaves")}>
        <circle cx="92" cy="190" r="62" fill={fillFor(colors, "leaves")} stroke={stroke} strokeWidth="3" />
      </g>
      <g {...region("fox", "fox")}>
        <ellipse cx="168" cy="430" rx="28" ry="14" fill={fillFor(colors, "fox")} stroke={stroke} strokeWidth="3" />
        <ellipse cx="230" cy="438" rx="62" ry="26" fill={fillFor(colors, "fox")} stroke={stroke} strokeWidth="3" />
        <circle cx="286" cy="404" r="26" fill={fillFor(colors, "fox")} stroke={stroke} strokeWidth="3" />
        <path d="M268 388l6-24 18 22" fill={fillFor(colors, "fox")} stroke={stroke} strokeWidth="3" strokeLinejoin="round" />
        <path d="M292 386l8-26 16 24" fill={fillFor(colors, "fox")} stroke={stroke} strokeWidth="3" strokeLinejoin="round" />
      </g>
      <g {...region("book", "book")}>
        <rect x="236" y="412" width="74" height="46" rx="6" fill={fillFor(colors, "book")} stroke={stroke} strokeWidth="3" />
      </g>
      <g {...region("lantern", "lantern")}>
        <path d="M318 300h36l-6-16h-24z" fill={fillFor(colors, "lantern")} stroke={stroke} strokeWidth="3" strokeLinejoin="round" />
        <rect x="322" y="300" width="28" height="40" rx="6" fill={fillFor(colors, "lantern")} stroke={stroke} strokeWidth="3" />
      </g>
      <g {...region("flower", "flower")}>
        <rect x="132" y="430" width="8" height="40" fill={fillFor(colors, "flower")} stroke={stroke} strokeWidth="3" />
        <circle cx="136" cy="418" r="14" fill={fillFor(colors, "flower")} stroke={stroke} strokeWidth="3" />
        <circle cx="136" cy="418" r="5" fill="#fffdf8" stroke={stroke} strokeWidth="3" />
      </g>
      <g pointerEvents="none" fill="none" stroke={stroke} strokeWidth="3" strokeLinecap="round">
        <path d="M273 412v46" />
        <circle cx="278" cy="402" r="1.5" fill={stroke} />
        <circle cx="296" cy="402" r="1.5" fill={stroke} />
        <path d="M40 470c16-12 20 6 36-4M300 470c12-10 18 6 30-2" />
      </g>
    </svg>
  );
}
