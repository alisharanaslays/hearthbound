import type { Metadata } from "next";
import { SketchUpload } from "@/components/SketchUpload";

export const metadata: Metadata = { title: "Upload artwork" };

export default function Page() {
  return <SketchUpload />;
}
