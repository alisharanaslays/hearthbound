import type { Metadata } from "next";
import { CozyCorner } from "@/components/CozyCorner";

export const metadata: Metadata = { title: "Cozy Corner" };

export default function Page() {
  return <CozyCorner />;
}
