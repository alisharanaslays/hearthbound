import type { Metadata } from "next";
import { ArtSubmitForm } from "@/components/ArtSubmitForm";

export const metadata: Metadata = { title: "Submit artwork" };

export default function Page() {
  return <ArtSubmitForm />;
}
