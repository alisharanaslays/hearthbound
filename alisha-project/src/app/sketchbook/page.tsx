import type { Metadata } from "next";
import { SketchbookHome } from "@/components/SketchbookHome";

export const metadata: Metadata = { title: "The Sketchbook" };

export default function Page() {
  return <SketchbookHome />;
}
