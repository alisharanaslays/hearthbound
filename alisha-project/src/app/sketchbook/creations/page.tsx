import type { Metadata } from "next";
import { SketchGallery } from "@/components/SketchGallery";

export const metadata: Metadata = { title: "My Creations" };

export default function Page() {
  return <SketchGallery />;
}
