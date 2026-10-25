import type { Book } from "./types";

export function pagesRecorded(books: Book[]) {
  return books.reduce((sum, book) => sum + book.pagesRead, 0);
}

export function pagesLoggedInYear(books: Book[], year: number) {
  const prefix = String(year);
  const total = books.reduce((sum, book) => {
    const yearTotal = book.progressLog.reduce((inner, entry) => {
      return entry.at.startsWith(prefix) ? inner + entry.delta : inner;
    }, 0);
    return sum + yearTotal;
  }, 0);
  return Math.max(0, total);
}

export function finishedInYear(books: Book[], year: number) {
  const prefix = String(year);
  return books.filter(
    (book) => book.status === "completed" && book.finishedOn?.startsWith(prefix),
  );
}

export function monthPoints(books: Book[], year: number, metric: "books" | "pages") {
  const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return labels.map((label, index) => {
    const key = `${year}-${String(index + 1).padStart(2, "0")}`;
    const value =
      metric === "books"
        ? books.filter((book) => book.status === "completed" && book.finishedOn?.startsWith(key)).length
        : Math.max(
            0,
            books.reduce(
              (sum, book) =>
                sum +
                book.progressLog.reduce(
                  (inner, entry) => (entry.at.startsWith(key) ? inner + entry.delta : inner),
                  0,
                ),
              0,
            ),
          );
    return { key, label, value };
  });
}

export function yearPoints(books: Book[], year: number, metric: "books" | "pages") {
  return [year - 3, year - 2, year - 1, year].map((entryYear) => {
    const key = String(entryYear);
    const value =
      metric === "books"
        ? finishedInYear(books, entryYear).length
        : pagesLoggedInYear(books, entryYear);
    return { key, label: key, value };
  });
}
