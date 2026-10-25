import type { MotifId } from "@/lib/types";

export function ArtworkMotif({ motif, title }: { motif: MotifId; title?: string }) {
  return (
    <svg viewBox="0 0 320 400" role={title ? "img" : "presentation"} aria-label={title} aria-hidden={title ? undefined : true}>
      {motif === "lantern-isle" && <LanternIsle />}
      {motif === "tea-dragon" && <TeaDragon />}
      {motif === "reading-fox" && <ReadingFox />}
      {motif === "glass-garden" && <GlassGarden />}
      {motif === "moon-hare" && <MoonHare />}
      {motif === "star-sailor" && <StarSailor />}
      {motif === "mapmaker" && <Mapmaker />}
      {motif === "two-weather" && <TwoWeather />}
    </svg>
  );
}

function LanternIsle() {
  return (
    <>
      <rect width="320" height="400" fill="#d9cff0" />
      <circle cx="250" cy="70" r="26" fill="#fbf6ee" />
      <circle cx="60" cy="54" r="3" fill="#fffdf8" />
      <circle cx="110" cy="90" r="2" fill="#fffdf8" />
      <circle cx="180" cy="48" r="2.4" fill="#fffdf8" />
      <path d="M0 250c40-40 80-20 120-40s80-10 120 20 80 10 80-10v180H0z" fill="#8fb4d4" />
      <path d="M0 310c50 20 90-10 140 10s90 20 180-20v100H0z" fill="#6ea0c8" />
      <ellipse cx="150" cy="330" rx="70" ry="18" fill="#5d5470" />
      <rect x="168" y="150" width="42" height="160" rx="6" fill="#f7f1e6" />
      <path d="M164 150h50l-8-28h-34z" fill="#4d3f6b" />
      <rect x="182" y="176" width="14" height="18" fill="#e7c98a" />
      <rect x="182" y="208" width="14" height="18" fill="#c9b8e4" />
      <rect x="182" y="240" width="14" height="18" fill="#e7c98a" />
      <path d="M210 168h70l-16 24h-54z" fill="#e7c98a" opacity="0.85" />
      <rect x="128" y="292" width="16" height="28" fill="#a85d73" />
      <rect x="146" y="300" width="14" height="20" fill="#2f5a40" />
    </>
  );
}

function TeaDragon() {
  return (
    <>
      <rect width="320" height="400" fill="#f8e4ea" />
      <rect y="250" width="320" height="150" fill="#f3d3c2" />
      <ellipse cx="170" cy="300" rx="120" ry="22" fill="#e7c4ae" />
      <path d="M118 250h54v-70h-40c-12 18-14 40-14 70z" fill="#fffdf8" />
      <path d="M172 196c22 8 28 28 24 48" fill="none" stroke="#d7a898" strokeWidth="8" />
      <path d="M132 168c6-20 8-28 4-40M148 160c8-22 6-30 2-42" fill="none" stroke="#c9b8e4" strokeWidth="4" strokeLinecap="round" />
      <ellipse cx="214" cy="236" rx="36" ry="22" fill="#7faf8a" />
      <path d="M196 220c20-28 48-20 52 4" fill="#afd3b4" />
      <circle cx="230" cy="228" r="10" fill="#7faf8a" />
      <circle cx="234" cy="226" r="1.6" fill="#2a2420" />
      <path d="M246 214l10-16 8 14" fill="#e7c98a" />
      <rect x="70" y="250" width="36" height="28" rx="3" fill="#4d3f6b" />
      <rect x="78" y="246" width="28" height="8" fill="#e7c98a" />
    </>
  );
}

function ReadingFox() {
  return (
    <>
      <rect width="320" height="400" fill="#e7e3f4" />
      <rect x="36" y="36" width="248" height="250" rx="28" fill="#c9d7ee" />
      <circle cx="230" cy="90" r="22" fill="#fbf6ee" />
      <circle cx="78" cy="78" r="2" fill="#fff" />
      <circle cx="120" cy="110" r="2" fill="#fff" />
      <rect x="36" y="250" width="248" height="18" fill="#efe2d0" />
      <rect y="300" width="320" height="100" fill="#f6efe4" />
      <ellipse cx="150" cy="330" rx="62" ry="28" fill="#e09a62" />
      <circle cx="206" cy="300" r="28" fill="#e09a62" />
      <path d="M186 286l8-22 16 20" fill="#e09a62" />
      <path d="M214 284l8-24 14 22" fill="#e09a62" />
      <ellipse cx="120" cy="336" rx="24" ry="12" fill="#e09a62" />
      <rect x="176" y="312" width="52" height="34" rx="4" fill="#4d3f6b" />
      <path d="M202 312v34" stroke="#e7c98a" strokeWidth="3" />
      <circle cx="198" cy="298" r="1.7" fill="#2a2420" />
      <circle cx="214" cy="298" r="1.7" fill="#2a2420" />
      <path d="M36 286c40 20 70 8 110 18" fill="none" stroke="#8fb58d" strokeWidth="8" strokeLinecap="round" />
    </>
  );
}

function GlassGarden() {
  return (
    <>
      <rect width="320" height="400" fill="#e7f2e6" />
      <rect x="48" y="70" width="224" height="250" rx="8" fill="#f7fbf7" stroke="#2f5a40" strokeWidth="6" />
      <path d="M160 70v250M48 150h224M48 230h224" stroke="#2f5a40" strokeWidth="4" />
      <path d="M70 70h180l-20-28H90z" fill="#d7ebda" stroke="#2f5a40" strokeWidth="6" />
      <rect x="78" y="250" width="22" height="48" fill="#6d5b8a" />
      <rect x="104" y="236" width="18" height="62" fill="#a85d73" />
      <ellipse cx="128" cy="230" rx="26" ry="16" fill="#8fb58d" />
      <rect x="186" y="246" width="24" height="52" fill="#3d5f80" />
      <ellipse cx="210" cy="236" rx="30" ry="18" fill="#b7d7a8" />
      <circle cx="150" cy="190" r="16" fill="#e7c98a" />
      <rect y="330" width="320" height="70" fill="#d5e6d2" />
    </>
  );
}

function MoonHare() {
  return (
    <>
      <rect width="320" height="400" fill="#f7f1e4" />
      <circle cx="210" cy="150" r="78" fill="#f3e2a8" />
      <circle cx="188" cy="132" r="64" fill="#f7f1e4" />
      <ellipse cx="118" cy="300" rx="46" ry="28" fill="#c9b8e4" />
      <ellipse cx="150" cy="268" rx="22" ry="18" fill="#c9b8e4" />
      <path d="M142 250l-6-48 16 28 14-40 8 46" fill="#c9b8e4" />
      <circle cx="158" cy="266" r="1.7" fill="#2a2420" />
      <path d="M70 330c30-20 70-10 110 8 30 14 70 8 100-12" fill="none" stroke="#8fb58d" strokeWidth="10" strokeLinecap="round" />
      <circle cx="250" cy="300" r="8" fill="#f3b6c8" />
      <circle cx="268" cy="286" r="8" fill="#e7c98a" />
      <rect x="246" y="306" width="4" height="22" fill="#2f5a40" />
    </>
  );
}

function StarSailor() {
  return (
    <>
      <rect width="320" height="400" fill="#d5e4f5" />
      <circle cx="70" cy="70" r="4" fill="#fff" />
      <circle cx="250" cy="50" r="3" fill="#fff" />
      <path d="M230 90l8 18h-16z" fill="#e7c98a" />
      <path d="M0 240c40 20 60-10 100 0s70 24 110 4 70-8 110 12v144H0z" fill="#8fb4d4" />
      <path d="M0 290c50 16 80-20 130-4s80 28 120 6 50-10 70 8v100H0z" fill="#6ea0c8" />
      <path d="M120 250l80 20-70 36z" fill="#fffdf8" />
      <path d="M150 168v110" stroke="#4d3f6b" strokeWidth="4" />
      <path d="M150 176l48 28-48 16z" fill="#f8dbe3" />
      <circle cx="150" cy="156" r="8" fill="#e7c98a" />
      <path d="M40 210h70M210 200h60" stroke="#fff" strokeWidth="6" strokeLinecap="round" opacity="0.7" />
    </>
  );
}

function Mapmaker() {
  return (
    <>
      <rect width="320" height="400" fill="#efe6d8" />
      <circle cx="250" cy="78" r="34" fill="#d9cff0" />
      <circle cx="70" cy="90" r="3" fill="#4d3f6b" />
      <circle cx="110" cy="60" r="2" fill="#4d3f6b" />
      <rect x="54" y="150" width="210" height="150" rx="12" fill="#fffdf8" />
      <path d="M80 250c30-40 40 10 70-20s40 30 90-10" fill="none" stroke="#3d5f80" strokeWidth="4" />
      <circle cx="150" cy="220" r="6" fill="#a85d73" />
      <path d="M70 168h24l8 16h-24z" fill="#f3d3c2" />
      <path d="M214 250h28l10 18h-30z" fill="#f3d3c2" />
      <path d="M86 176h16M230 262h16" stroke="#a85d73" strokeWidth="3" />
      <rect x="120" y="300" width="80" height="14" rx="4" fill="#4d3f6b" />
    </>
  );
}

function TwoWeather() {
  return (
    <>
      <rect width="160" height="400" fill="#d5e4f5" />
      <rect x="160" width="160" height="400" fill="#f8e4c8" />
      <rect x="46" y="70" width="228" height="230" rx="16" fill="#fffdf8" stroke="#2a2420" strokeWidth="6" />
      <path d="M160 76v218" stroke="#2a2420" strokeWidth="4" />
      <circle cx="112" cy="130" r="16" fill="#f7f1e4" />
      <path d="M70 210c16 10 24-8 40 0s28 12 46-4" fill="none" stroke="#8fb4d4" strokeWidth="6" strokeLinecap="round" />
      <circle cx="230" cy="120" r="18" fill="#e7c98a" />
      <circle cx="200" cy="210" r="10" fill="#8fb58d" />
      <circle cx="224" cy="196" r="12" fill="#b7d7a8" />
      <circle cx="248" cy="208" r="9" fill="#f3b6c8" />
      <rect x="120" y="268" width="80" height="18" fill="#efe2d0" />
      <rect x="132" y="248" width="56" height="24" rx="3" fill="#6d5b8a" />
    </>
  );
}
