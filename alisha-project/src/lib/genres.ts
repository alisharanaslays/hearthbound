export const GENRES = [
  "Fantasy",
  "Mystery",
  "Adventure",
  "Animals",
  "Fairy tales",
  "Poetry",
  "Science",
  "History",
  "Graphic stories",
  "Realistic fiction",
  "Science fiction",
  "Classics",
] as const;

export type Genre = (typeof GENRES)[number];

export const GENRE_STYLE: Record<
  string,
  { from: string; to: string; symbol: "star" | "key" | "leaf" | "paw" | "ship" | "book" | "moon" | "atom" }
> = {
  Fantasy: { from: "#6d5b8a", to: "#2a2144", symbol: "star" },
  Mystery: { from: "#3d5f80", to: "#1c3148", symbol: "key" },
  Adventure: { from: "#3f6b62", to: "#1d3330", symbol: "ship" },
  Animals: { from: "#c47a45", to: "#5c3418", symbol: "paw" },
  "Fairy tales": { from: "#a85d73", to: "#4d2434", symbol: "moon" },
  Poetry: { from: "#8b6b93", to: "#3a2a40", symbol: "leaf" },
  Science: { from: "#3e6d8a", to: "#173246", symbol: "atom" },
  History: { from: "#8a6244", to: "#3d2918", symbol: "book" },
  "Graphic stories": { from: "#5b6e9a", to: "#242c44", symbol: "book" },
  "Realistic fiction": { from: "#6d7a58", to: "#2c3324", symbol: "leaf" },
  "Science fiction": { from: "#4d5d8a", to: "#1e2440", symbol: "atom" },
  Classics: { from: "#7a4e5a", to: "#3a2228", symbol: "book" },
};

export function genreStyle(genre: string) {
  return GENRE_STYLE[genre] ?? { from: "#6d5b8a", to: "#2a2144", symbol: "book" as const };
}
