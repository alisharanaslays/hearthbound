"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/appearance", label: "Look and words" },
  { href: "/admin/books", label: "Books" },
  { href: "/admin/reviews", label: "Shelf notes" },
];

export function DeskNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <div className="desk-nav">
      {LINKS.map((link) => (
        <Link key={link.href} href={link.href} className="btn" aria-current={pathname === link.href ? "page" : undefined}>
          {link.label}
        </Link>
      ))}
      <Link className="btn quiet" href="/">
        View the site
      </Link>
      <button type="button" className="btn quiet" onClick={() => void logout()}>
        Sign out
      </button>
    </div>
  );
}
