import type { Metadata } from "next";
import { ReadingDashboard } from "@/components/ReadingDashboard";
import { allGenres, loadContent } from "@/lib/site";

export const metadata: Metadata = { title: "My Reading" };

export default async function Page() {
  const content = await loadContent();
  return (
    <ReadingDashboard
      catalog={content.books}
      genres={allGenres(content)}
      notes={content.reviews.filter((review) => review.visible)}
    />
  );
}
