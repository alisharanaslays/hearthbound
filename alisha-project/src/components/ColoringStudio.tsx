"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { LIMITS } from "@/lib/storage";
import { useStore } from "@/lib/use-store";
import { COLORS, ColoringScene, REGIONS } from "./ColoringScene";
import { PageHeader } from "./PageHeader";
import { Notice } from "./ui";

export function ColoringStudio({ creationId, justSaved }: { creationId: string | null; justSaved?: string | null }) {
  const router = useRouter();
  const { store, ready, update, notice } = useStore();
  const [title, setTitle] = useState("My coloring page");
  const [colors, setColors] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<string>(COLORS[1].hex);
  const [announcement, setAnnouncement] = useState("");
  const [saved, setSaved] = useState("");
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(creationId);

  useEffect(() => {
    if (!store || !creationId) return;
    const existing = store.shelf.find((item) => item.id === creationId && item.kind === "coloring");
    if (existing && existing.kind === "coloring") {
      setTitle(existing.title);
      setColors(existing.colors);
      setEditingId(existing.id);
    }
  }, [store, creationId]);

  function paint(id: string) {
    const region = REGIONS.find((item) => item.id === id);
    setColors((current) => ({ ...current, [id]: selected }));
    const name = COLORS.find((color) => color.hex === selected)?.name ?? "color";
    setAnnouncement(`${region?.label ?? "Shape"} colored ${name}.`);
  }

  function save(event: FormEvent) {
    event.preventDefault();
    const nextTitle = title.trim();
    if (nextTitle.length < 2 || nextTitle.length > 40) {
      setError("Give the page a name, from 2 to 40 characters.");
      return;
    }
    if (!store) return;
    if (!editingId && store.shelf.length >= LIMITS.shelf) {
      setError("Your private shelf is full. Remove something from Cozy Corner first.");
      return;
    }
    const id = editingId ?? crypto.randomUUID();
    const now = new Date().toISOString();
    const result = update((current) => {
      const existing = current.shelf.find((item) => item.id === id);
      const entry = {
        id,
        kind: "coloring" as const,
        title: nextTitle,
        colors,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
      };
      return {
        ...current,
        shelf: [entry, ...current.shelf.filter((item) => item.id !== id)],
      };
    });
    setEditingId(id);
    setError("");
    setSaved(result.ok ? "Saved on your private shelf." : "The page is open for this visit, but the browser could not store it.");
    router.replace(`/cozy/color?id=${id}&saved=${result.ok ? "1" : "0"}`);
  }

  return (
    <div className="wrap page cozy">
      <PageHeader
        eyebrow="Prototype"
        title="Color a page"
        lede="Pick a color, then choose a shape. You can use a tap, or Tab and Enter. Printing uses the colors you have chosen. Leave the page uncolored if you want a blank sheet."
      >
        <Link className="btn quiet" href="/cozy">Back to Cozy Corner</Link>
      </PageHeader>
      {notice ? <Notice tone="error">{notice}</Notice> : null}
      {saved || justSaved === "1" ? <Notice tone="good">{saved || "Saved on your private shelf."}</Notice> : null}
      {!saved && justSaved === "0" ? <Notice tone="error">The page is open for this visit, but the browser could not store it.</Notice> : null}
      {error ? <Notice tone="error">{error}</Notice> : null}
      <p className="sr-only" aria-live="polite">{announcement}</p>
      <p>
        Selected color: <strong>{COLORS.find((color) => color.hex === selected)?.name}</strong>
      </p>
      <div className="palette" role="group" aria-label="Color palette">
        {COLORS.map((color) => (
          <button
            key={color.id}
            type="button"
            className="swatch"
            aria-pressed={selected === color.hex}
            onClick={() => setSelected(color.hex)}
          >
            <i style={{ background: color.hex }} />
            {color.name}
          </button>
        ))}
      </div>
      <div className="coloring-sheet" style={{ marginTop: "1rem" }}>
        <ColoringScene colors={colors} onPaint={paint} />
      </div>
      <div className="cluster no-print" style={{ marginTop: "1rem" }}>
        <button type="button" className="btn quiet" onClick={() => { setColors({}); setAnnouncement("Page cleared."); }}>
          Clear colors
        </button>
        <button type="button" className="btn" onClick={() => window.print()}>
          Print
        </button>
      </div>
      <form className="card no-print" style={{ marginTop: "1rem" }} onSubmit={save} noValidate>
        <div className="field">
          <label htmlFor="color-title">Name this page</label>
          <input id="color-title" value={title} maxLength={40} onChange={(event) => setTitle(event.target.value)} />
        </div>
        <button className="btn primary" type="submit" disabled={!ready}>
          Save to my private shelf
        </button>
      </form>
    </div>
  );
}
