import type { Metadata } from "next";
import Link from "next/link";
import { ShelfNotes } from "@/components/ShelfNotes";
import { PageHeader } from "@/components/PageHeader";
import { loadContent } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const content = await loadContent();
  return { title: content.copy.reviewsHeading };
}

export default async function Page() {
  const content = await loadContent();
  const any = content.reviews.some((review) => review.visible && content.books.some((book) => book.id === review.bookId));
  return (
    <div className="wrap page">
      <PageHeader eyebrow={content.copy.siteName} title={content.copy.reviewsHeading} lede={content.copy.reviewsLede} />
      {any ? (
        <ShelfNotes reviews={content.reviews} books={content.books} heading="" lede="" />
      ) : (
        <p>No shelf notes are showing right now.</p>
      )}
      <p style={{ marginTop: "1.2rem" }}>
        <Link href="/reading#suggestions">See the book list on My Reading</Link>
      </p>
    </div>
  );
}
