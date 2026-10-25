"use client";

import Link from "next/link";
import { useState } from "react";
import { prettyDate } from "@/lib/dates";
import { useStore } from "@/lib/use-store";
import { ColoringScene } from "./ColoringScene";
import { PageHeader } from "./PageHeader";
import { Picture } from "./Pictures";
import { ConfirmButton, Notice } from "./ui";

export function CozyCorner() {
  const { store, ready, update } = useStore();
  const [shareNote, setShareNote] = useState("");
  const [shareError, setShareError] = useState("");

  async function askServer() {
    setShareError("");
    setShareNote("Asking the server…");
    try {
      const response = await fetch("/api/publications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "cozy-share" }),
      });
      const data = (await response.json()) as { reason?: string };
      setShareNote(data.reason ?? "Sharing is closed.");
    } catch {
      setShareError("The server could not be reached. Nothing was shared.");
      setShareNote("");
    }
  }

  return (
    <div className="wrap page cozy">
      <PageHeader
        eyebrow="A quieter room"
        title="Cozy Corner"
        lede="A calm place to color a page or make a little book. It is especially gentle for younger children, with a grown-up nearby. In this prototype, creations stay on this device."
      />
      <div className="choice-grid">
        <Link className="card big-choice wash-sage" href="/cozy/color">
          <strong>Color a page</strong>
          <span>A fox, a tree, a book, and a lantern. Pick a color, then tap a shape.</span>
        </Link>
        <Link className="card big-choice wash-pink" href="/cozy/book">
          <strong>Make a little book</strong>
          <span>Choose pictures, type a few words, and read them aloud. Nothing is recorded.</span>
        </Link>
      </div>

      <section className="section" aria-labelledby="shelf-heading">
        <h2 id="shelf-heading">Private shelf</h2>
        {!ready || !store ? (
          <p role="status">Opening your shelf…</p>
        ) : store.shelf.length === 0 ? (
          <div className="card empty">
            <h3>Nothing saved yet.</h3>
            <p>When you save a coloring page or a little book, it waits here. Only this browser can see it.</p>
          </div>
        ) : (
          <div className="grid-2">
            {store.shelf.map((item) => (
              <article key={item.id} className="card">
                {item.kind === "coloring" ? (
                  <div className="shelf-thumb" aria-hidden="true">
                    <ColoringScene colors={item.colors} />
                  </div>
                ) : (
                  <Picture id={item.pages[0]?.picture ?? "star"} />
                )}
                <h3>{item.title}</h3>
                <p className="meta">{item.kind === "coloring" ? "Coloring page" : "Little book"} · Updated {prettyDate(item.updatedAt)}</p>
                <div className="cluster">
                  <Link className="btn" href={item.kind === "coloring" ? `/cozy/color?id=${item.id}` : `/cozy/book?id=${item.id}`}>
                    Open
                  </Link>
                  <ConfirmButton
                    label="Remove"
                    prompt={`Remove ${item.title}?`}
                    confirmLabel="Yes, remove"
                    onConfirm={() => update((current) => ({ ...current, shelf: current.shelf.filter((entry) => entry.id !== item.id) }))}
                  />
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="section card" aria-labelledby="parent-heading">
        <h2 id="parent-heading">For a parent</h2>
        <p>
          Children under 14 are meant to keep work private, and later share a chosen piece only with a securely linked guardian.
          This prototype does not collect an email, create a guardian link, or publish anything.
        </p>
        <button type="button" className="btn" onClick={askServer}>
          Ask whether sharing is open
        </button>
        {shareNote ? <p role="status">{shareNote}</p> : null}
        {shareError ? <Notice tone="error">{shareError}</Notice> : null}
      </section>
    </div>
  );
}
