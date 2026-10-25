import type { Metadata } from "next";

export const metadata: Metadata = { title: "Color a page" };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
