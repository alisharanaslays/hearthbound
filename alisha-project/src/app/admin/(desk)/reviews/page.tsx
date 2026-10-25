import type { Metadata } from "next";
import { ReviewDesk } from "@/components/admin/ReviewDesk";
import { PageHeader } from "@/components/PageHeader";
import { loadContent } from "@/lib/site";

export const metadata: Metadata = { title: "Shelf notes" };

export default async function Page() {
  const content = await loadContent();
  return (
    <>
      <PageHeader
        eyebrow="Site desk"
        title="Shelf notes"
        lede="A note is a short, kind comment attached to a book. Hidden notes stay in this desk and off the public site."
      />
      <ReviewDesk books={content.books} reviews={content.reviews} />
    </>
  );
}
