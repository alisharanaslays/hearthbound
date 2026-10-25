import type { Metadata } from "next";
import Link from "next/link";
import { loadContent } from "@/lib/site";

export const metadata: Metadata = { title: "Site desk" };

export default async function Page() {
  const content = await loadContent();
  const showing = content.reviews.filter((review) => review.visible).length;
  const featured = content.books.filter((book) => book.featured).length;

  return (
    <>
      <h1>What you can change</h1>
      <p className="lede">
        The desk writes a file on this server, <code>data/content.json</code>. The public pages read it. A visitor’s reading shelf, artwork, and coloring are still stored only in their browser.
      </p>
      <div className="grid-3">
        <Link className="card room-card wash-lavender" href="/admin/appearance">
          <h2>Look and words</h2>
          <p>Name, motto, homepage text, colors, and corner softness.</p>
        </Link>
        <Link className="card room-card wash-sage" href="/admin/books">
          <h2>Books</h2>
          <p>
            {content.books.length} on the public list. {featured} marked for the homepage.
          </p>
        </Link>
        <Link className="card room-card wash-pink" href="/admin/reviews">
          <h2>Shelf notes</h2>
          <p>
            {content.reviews.length} notes, {showing} showing. Visitors cannot add their own.
          </p>
        </Link>
      </div>
      <section className="card" style={{ marginTop: "1.2rem" }}>
        <h2>What this desk is not</h2>
        <p>It is not visitor accounts, age assurance, or moderation. Publishing artwork and stories is still closed. One shared secret opens this door, and anyone with that secret can edit the public words and lists.</p>
        <p>Do not use the desk to publish children’s personal details, or to claim the site is fully safe.</p>
      </section>
    </>
  );
}
