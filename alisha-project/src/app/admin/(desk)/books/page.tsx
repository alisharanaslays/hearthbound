import type { Metadata } from "next";
import { BookDesk } from "@/components/admin/BookDesk";
import { PageHeader } from "@/components/PageHeader";
import { allGenres, loadContent } from "@/lib/site";

export const metadata: Metadata = { title: "Books" };

export default async function Page() {
  const content = await loadContent();
  return (
    <>
      <PageHeader
        eyebrow="Site desk"
        title="Books"
        lede="Add the titles you want to suggest. Mark a few for the homepage. Page counts can stay approximate."
      />
      <BookDesk books={content.books} genres={allGenres(content)} />
    </>
  );
}
