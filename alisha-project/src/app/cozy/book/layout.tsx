import type { Metadata } from "next";

export const metadata: Metadata = { title: "Make a little book" };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
