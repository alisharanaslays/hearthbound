"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { IconPencil } from "./Icons";
import { LogoMark } from "./Logo";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/reading", label: "My Reading" },
  { href: "/art", label: "Art Hub" },
  { href: "/sketchbook", label: "The Sketchbook", icon: true },
  { href: "/cozy", label: "Cozy Corner" },
  { href: "/studio", label: "Story Studio", soon: true },
  { href: "/library", label: "My Library" },
];

function isCurrent(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader({ siteName }: { siteName: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const navRef = useRef<HTMLElement>(null);

  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setOpen(false);
    document.getElementById("main")?.focus();
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const items = (idPrefix: string) =>
    LINKS.map((link) => (
      <Link
        key={`${idPrefix}-${link.href}`}
        href={link.href}
        aria-current={isCurrent(pathname, link.href) ? "page" : undefined}
      >
        {link.icon ? <IconPencil /> : null}
        {link.label}
        {link.soon ? <span className="soon">Soon</span> : null}
      </Link>
    ));

  return (
    <header className="site-header">
      <div className="wrap header-inner">
        <Link href="/" className="brand">
          <LogoMark />
          {siteName}
        </Link>
        <nav className="desktop-nav" aria-label="Main">
          {items("desk")}
        </nav>
        <button
          ref={buttonRef}
          type="button"
          className="btn menu-button"
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>
      <nav
        id="mobile-nav"
        ref={navRef}
        className="mobile-nav"
        data-open={open ? "true" : "false"}
        aria-label="Main"
      >
        {items("mobile")}
      </nav>
    </header>
  );
}
