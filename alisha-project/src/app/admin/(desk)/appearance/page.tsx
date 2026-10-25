import type { Metadata } from "next";
import { AppearanceForm } from "@/components/admin/AppearanceForm";
import { PageHeader } from "@/components/PageHeader";
import { loadContent } from "@/lib/site";

export const metadata: Metadata = { title: "Look and words" };

export default async function Page() {
  const content = await loadContent();
  return (
    <>
      <PageHeader
        eyebrow="Site desk"
        title="Look and words"
        lede="These fields change the public homepage, the name in the header, and the colors across the site. Books and notes are edited on their own pages."
      />
      <AppearanceForm copy={content.copy} theme={content.theme} />
    </>
  );
}
