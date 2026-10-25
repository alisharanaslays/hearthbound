import type { Book, CatalogBook } from "./types";

export function recommendBooks(catalog: CatalogBook[], books: Book[], favoriteGenres: string[]) {
  const owned = new Set(books.map((book) => book.title.trim().toLowerCase()));
  const weights = new Map<string, number>();

  for (const genre of favoriteGenres) {
    weights.set(genre, (weights.get(genre) ?? 0) + 2);
  }

  for (const book of books) {
    const weight = book.favorite ? 4 : book.status === "completed" ? 3 : book.status === "reading" ? 2 : 1;
    weights.set(book.genre, (weights.get(book.genre) ?? 0) + weight);
  }

  const available = catalog.filter((item) => !owned.has(item.title.trim().toLowerCase()));
  const personalized = [...weights.values()].some((weight) => weight > 0);

  if (!personalized) {
    return available.slice(0, 4).map((item) => ({
      item,
      reason: "A starting suggestion from the curated list.",
    }));
  }

  return available
    .map((item) => ({ item, score: weights.get(item.genre) ?? 0 }))
    .sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title))
    .slice(0, 4)
    .map(({ item, score }) => ({
      item,
      reason:
        score > 0
          ? `${item.genre} shows up in your shelf or the genres you chose.`
          : "Another title from the curated list, beside your genres.",
    }));
}
