import type { Metadata } from "next";
import { ArtGallery } from "@/components/ArtGallery";

export const metadata: Metadata = { title: "Art Hub" };

export default function Page() {
  return <ArtGallery />;
}
