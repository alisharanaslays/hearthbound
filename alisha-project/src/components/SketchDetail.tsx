"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LIMITS } from "@/lib/storage";
import { askToPublish, SKETCH_CATEGORIES, SKETCH_LIMITS, toArtCategory } from "@/lib/sketch";
import type { SketchCategory } from "@/lib/types";
import { useStore } from "@/lib/use-store";
import { ReviewLegend, SketchBadge } from "./SketchStatus";
import { ConfirmButton, Notice } from "./ui";

export function SketchDetail({ id, justSaved }: { id: string; justSaved: boolean }) {
  const router = useRouter();
  const { store, ready, update } = useStore();
  const item = store?.sketches.find((sketch) => sketch.id === id);
  const [title, setTitle] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);
  const [category, setCategory] = useState<SketchCategory | null>(null);
  const [notice, setNotice] = useState(justSaved ? "Saved in this browser." : "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (!ready) return <div className="wrap page sketchbook"><p role="status">Opening this creation…</p></div>;
  if (!item) {
    return (
      <div className="wrap page sketchbook">
        <Notice tone="error">That creation is not saved in this browser.</Notice>
        <Link className="btn" href="/sketchbook/creations">
          My Creations
        </Link>
      </div>
    );
  }

  const currentTitle = title ?? item.title;
  const currentDescription = description ?? item.description;
  const currentCategory = category ?? item.category;

  function saveFields() {
    const cleanTitle = currentTitle.trim();
    if (cleanTitle.length < 2) {
      setError("Add a title of at least two characters.");
      return false;
    }
    const result = update((current) => ({
      ...current,
      sketches: current.sketches.map((sketch) =>
        sketch.id === id
          ? {
              ...sketch,
              title: cleanTitle.slice(0, SKETCH_LIMITS.title),
              description: currentDescription.trim().slice(0, SKETCH_LIMITS.description),
              category: currentCategory,
              updatedAt: new Date().toISOString(),
            }
          : sketch,
      ),
    }));
    if (!result.ok) {
      setError(result.message ?? "This browser could not store that change.");
      return false;
    }
    setError("");
    setNotice("Saved in this browser.");
    return true;
  }

  async function submit() {
    if (!saveFields() || !item?.imageDataUrl) {
      if (item && !item.imageDataUrl) setError("This drawing has no preview image, so it cannot be copied to the private Art Hub list.");
      return;
    }
    if (store && !store.submissions.some((art) => art.id === id) && store.submissions.length >= LIMITS.submissions) {
      setError(`The private Art Hub list is full (${LIMITS.submissions}). Remove one from My Library first. Nothing was submitted.`);
      return;
    }
    setBusy(true);
    const reply = await askToPublish();
    const result = update((current) => {
      const sketches = current.sketches.map((sketch) =>
        sketch.id === id ? { ...sketch, askedReview: true, reviewReply: reply, updatedAt: new Date().toISOString() } : sketch,
      );
      const source = sketches.find((sketch) => sketch.id === id);
      const submissions = source?.imageDataUrl
        ? [
            {
              id,
              title: source.title,
              description: source.description || "A private piece from The Sketchbook.",
              category: toArtCategory(source.category),
              imageDataUrl: source.imageDataUrl,
              createdAt: source.createdAt,
            },
            ...current.submissions.filter((art) => art.id !== id),
          ].slice(0, LIMITS.submissions)
        : current.submissions;
      return { ...current, sketches, submissions };
    });
    setBusy(false);
    if (!result.ok) {
      setError(result.message ?? "The private copy could not be stored.");
      return;
    }
    setNotice(reply);
  }

  function remove() {
    update((current) => ({
      ...current,
      sketches: current.sketches.filter((sketch) => sketch.id !== id),
      submissions: current.submissions.filter((art) => art.id !== id),
    }));
    router.push("/sketchbook/creations");
  }

  return (
    <div className="wrap page sketchbook">
      <header className="page-header">
        <p className="eyebrow">{item.kind === "drawing" ? "Drawing" : "Upload"}</p>
        <h1>{item.title}</h1>
        <SketchBadge item={item} />
        <div className="cluster">
          <Link className="btn quiet" href="/sketchbook/creations">
            My Creations
          </Link>
          {item.kind === "drawing" ? (
            <Link className="btn" href={`/sketchbook/draw?id=${item.id}`}>
              Continue drawing
            </Link>
          ) : null}
        </div>
      </header>
      {notice ? <Notice tone="good">{notice}</Notice> : null}
      {error ? <Notice tone="error">{error}</Notice> : null}
      {item.reviewReply ? <p className="prototype-note">{item.reviewReply}</p> : null}
      <ReviewLegend />
      <figure className="card preview-frame">
        {item.imageDataUrl ? (
          <img src={item.imageDataUrl} alt={`Preview of ${item.title}`} />
        ) : (
          <p>This drawing has no stored preview. Open it to keep drawing.</p>
        )}
      </figure>
      <form
        className="card stack"
        style={{ marginTop: "1rem" }}
        onSubmit={(event) => {
          event.preventDefault();
          saveFields();
        }}
      >
        <div>
          <label htmlFor="detail-title">Title</label>
          <input id="detail-title" value={currentTitle} maxLength={SKETCH_LIMITS.title} onChange={(event) => setTitle(event.target.value)} />
        </div>
        <div>
          <label htmlFor="detail-description">Description, optional</label>
          <textarea
            id="detail-description"
            value={currentDescription}
            maxLength={SKETCH_LIMITS.description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>
        <div>
          <label htmlFor="detail-category">Category</label>
          <select id="detail-category" value={currentCategory} onChange={(event) => setCategory(event.target.value as SketchCategory)}>
            {SKETCH_CATEGORIES.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </div>
        {item.kind === "upload" ? <p className="hint">Uploads can be retitled here. To change the picture, upload it again as a new creation.</p> : null}
        <div className="cluster">
          <button className="btn primary" type="submit">
            Save details
          </button>
          <button className="btn" type="button" disabled={busy} onClick={() => void submit()}>
            {busy ? "Asking…" : "Submit to Art Hub"}
          </button>
          <ConfirmButton label="Delete" prompt="Delete this creation from this device?" confirmLabel="Delete it" onConfirm={remove} />
        </div>
      </form>
    </div>
  );
}
