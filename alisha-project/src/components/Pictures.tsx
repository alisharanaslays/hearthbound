import type { PictureId } from "@/lib/types";

export const PICTURES: { id: PictureId; label: string }[] = [
  { id: "fox", label: "Fox" },
  { id: "moon", label: "Moon" },
  { id: "boat", label: "Boat" },
  { id: "tree", label: "Tree" },
  { id: "dragon", label: "Dragon" },
  { id: "house", label: "House" },
  { id: "star", label: "Star" },
  { id: "flower", label: "Flower" },
];

export function Picture({ id }: { id: PictureId }) {
  return (
    <svg viewBox="0 0 160 140" aria-hidden="true">
      <rect width="160" height="140" rx="16" fill="#f7f1e6" />
      {id === "fox" && (
        <>
          <ellipse cx="80" cy="88" rx="36" ry="18" fill="#e09a62" />
          <circle cx="108" cy="70" r="16" fill="#e09a62" />
          <path d="M98 62l4-16 10 14" fill="#e09a62" />
          <circle cx="104" cy="68" r="1.5" fill="#2a2420" />
        </>
      )}
      {id === "moon" && (
        <>
          <circle cx="78" cy="70" r="28" fill="#e7c98a" />
          <circle cx="90" cy="64" r="22" fill="#f7f1e6" />
          <circle cx="48" cy="40" r="2" fill="#4d3f6b" />
          <circle cx="120" cy="36" r="2" fill="#4d3f6b" />
        </>
      )}
      {id === "boat" && (
        <>
          <path d="M20 96c30 10 90 10 120 0" fill="none" stroke="#8fb4d4" strokeWidth="8" />
          <path d="M48 96l32-10 28 14z" fill="#fffdf8" />
          <path d="M78 50v40" stroke="#4d3f6b" strokeWidth="3" />
          <path d="M78 54l26 16-26 8z" fill="#f3b6c8" />
        </>
      )}
      {id === "tree" && (
        <>
          <rect x="74" y="78" width="12" height="32" fill="#8a6244" />
          <circle cx="80" cy="64" r="28" fill="#8fb58d" />
        </>
      )}
      {id === "dragon" && (
        <>
          <ellipse cx="78" cy="84" rx="30" ry="16" fill="#8fb58d" />
          <circle cx="108" cy="72" r="12" fill="#8fb58d" />
          <path d="M100 64l6-14 8 12" fill="#e7c98a" />
          <path d="M60 78c-8-20 8-28 8-28" fill="none" stroke="#b7d7a8" strokeWidth="6" />
        </>
      )}
      {id === "house" && (
        <>
          <path d="M40 78l40-32 40 32" fill="#a85d73" />
          <rect x="52" y="78" width="56" height="36" fill="#f3e2cf" />
          <rect x="74" y="92" width="14" height="22" fill="#4d3f6b" />
        </>
      )}
      {id === "star" && <path d="M80 28l8 22h24l-19 14 7 22-20-14-20 14 7-22-19-14h24z" fill="#e7c98a" />}
      {id === "flower" && (
        <>
          <rect x="76" y="78" width="6" height="32" fill="#2f5a40" />
          <circle cx="70" cy="70" r="12" fill="#f3b6c8" />
          <circle cx="90" cy="70" r="12" fill="#e7c98a" />
          <circle cx="80" cy="58" r="12" fill="#c9b8e4" />
          <circle cx="80" cy="74" r="8" fill="#fffdf8" />
        </>
      )}
    </svg>
  );
}
