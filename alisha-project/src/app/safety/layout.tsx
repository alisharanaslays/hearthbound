import type { Metadata } from "next";

export const metadata: Metadata = { title: "Safety and privacy" };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
