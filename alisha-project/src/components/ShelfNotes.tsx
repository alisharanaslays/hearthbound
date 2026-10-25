import { BookCover } from "./BookCover";
import type { SiteBook, SiteReview } from "@/lib/site";

export function ShelfNotes({
  reviews,
  books,
  heading,
  lede,
}: {
  reviews: SiteReview[];
  books: SiteBook[];
  heading: string;
  lede: string;
}) {
  const visible = reviews.filter((review) => review.visible);
  const byId = new Map(books.map((book) => [book.id, book]));
  const notes = visible.flatMap((review) => {
    const book = byId.get(review.bookId);
    return book ? [{ review, book }] : [];
  });
  if (notes.length === 0) return null;

  return (
    <section className="section" aria-labelledby={heading ? "notes-heading" : undefined}>
      {heading ? <h2 id="notes-heading">{heading}</h2> : null}
      {lede ? <p className="lede">{lede}</p> : null}
      <div className="grid-3">
        {notes.map(({ review, book }) => (
          <article key={review.id} className="card">
            <div className="book-card">
              <BookCover title={book.title} author={book.author} genre={book.genre} />
              <div>
                <h3>{book.title}</h3>
                <blockquote className="shelf-note">
                  <p>{review.quote}</p>
                  <footer>— {review.reviewer}</footer>
                </blockquote>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
