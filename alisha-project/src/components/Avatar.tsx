import type { AvatarId } from "@/lib/types";

const labels: Record<AvatarId, string> = {
  fox: "Fox",
  moon: "Moon",
  mushroom: "Mushroom",
  book: "Book",
  star: "Star",
  whale: "Whale",
};

export const AVATARS: AvatarId[] = ["fox", "moon", "mushroom", "book", "star", "whale"];

export function avatarLabel(id: AvatarId) {
  return labels[id];
}

export function Avatar({ id, title }: { id: AvatarId; title?: string }) {
  return (
    <svg viewBox="0 0 64 64" role={title ? "img" : "presentation"} aria-label={title} aria-hidden={title ? undefined : true}>
      <circle cx="32" cy="32" r="30" fill="#f4efe6" />
      {id === "fox" && (
        <>
          <path d="M14 26 22 14l8 12" fill="#e09a62" />
          <path d="M50 26 42 14l-8 12" fill="#e09a62" />
          <ellipse cx="32" cy="36" rx="16" ry="14" fill="#e09a62" />
          <ellipse cx="32" cy="40" rx="7" ry="5" fill="#f6e7d4" />
          <circle cx="26" cy="34" r="1.6" fill="#2a2420" />
          <circle cx="38" cy="34" r="1.6" fill="#2a2420" />
        </>
      )}
      {id === "moon" && (
        <path d="M36 14a16 16 0 1 0 12 26 13 13 0 1 1-12-26z" fill="#e7c98a" />
      )}
      {id === "mushroom" && (
        <>
          <path d="M12 34c2-12 10-18 20-18s18 6 20 18z" fill="#c96b86" />
          <rect x="27" y="32" width="10" height="16" rx="4" fill="#f3e2cf" />
          <circle cx="24" cy="26" r="3" fill="#f8e7ee" />
          <circle cx="38" cy="24" r="2.4" fill="#f8e7ee" />
        </>
      )}
      {id === "book" && (
        <>
          <path d="M14 18h16c3 3 3 22 0 28H14z" fill="#4d3f6b" />
          <path d="M50 18H34c-3 3-3 22 0 28h16z" fill="#6d5b8a" />
          <path d="M30 18c1.2 4 1.2 24 0 28" stroke="#fbf6ee" strokeWidth="2" fill="none" />
        </>
      )}
      {id === "star" && (
        <path d="M32 12l4.8 12.2H50l-10.4 7.6 4 12.2L32 37.2 20.4 44l4-12.2L14 24.2h13.2z" fill="#e7c98a" />
      )}
      {id === "whale" && (
        <>
          <path d="M10 36c8 8 28 10 40 2-6 8-20 10-32 4-4 6-10 8-14 6 4-2 6-8 6-12z" fill="#6f93b8" />
          <circle cx="40" cy="32" r="1.5" fill="#2a2420" />
        </>
      )}
    </svg>
  );
}
