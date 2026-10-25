"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fileToJpeg } from "@/lib/images";
import { LIMITS } from "@/lib/storage";
import { askToPublish, SKETCH_CATEGORIES, SKETCH_LIMITS, sketchFileError, toArtCategory } from "@/lib/sketch";
import type { SketchCategory, SketchItem } from "@/lib/types";
import { useStore } from "@/lib/use-store";
import { Notice } from "./ui";

export function SketchUpload() {
  const router = useRouter();
  const { store, update } = useStore();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [stored, setStored] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<SketchCategory>("Book Fan Art");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!file) {
      setPreview("");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  async function choose(next: File | null) {
    setError("");
    setStored("");
    if (!next) {
      setFile(null);
      return;
    }
    const problem = sketchFileError(next);
    if (problem) {
      setFile(null);
      setError(problem);
      return;
    }
    try {
      setStored(await fileToJpeg(next));
      setFile(next);
    } catch (caught) {
      setFile(null);
      setStored("");
      setError(caught instanceof Error ? caught.message : "That image could not be prepared.");
    }
  }

  function itemFromForm(): SketchItem | string {
    const cleanTitle = title.trim();
    if (cleanTitle.length < 2) return "Add a title of at least two characters.";
    if (!stored) return "Choose an image before saving.";
    const now = new Date().toISOString();
    return {
      id: crypto.randomUUID(),
      kind: "upload",
      title: cleanTitle.slice(0, SKETCH_LIMITS.title),
      description: description.trim().slice(0, SKETCH_LIMITS.description),
      category,
      imageDataUrl: stored,
      askedReview: false,
      createdAt: now,
      updatedAt: now,
    };
  }

  async function save(submit: boolean) {
    setError("");
    const item = itemFromForm();
    if (typeof item === "string") {
      setError(item);
      return;
    }
    setBusy(true);
    const libraryFull = Boolean(submit && store && store.submissions.length >= LIMITS.submissions);
    const reply = submit ? await askToPublish() : undefined;
    const note = reply ? `${reply}${libraryFull ? " My Library's private list is full, so that list did not get a copy." : ""}` : undefined;
    let blocked = false;
    const result = update((current) => {
      if (current.sketches.length >= LIMITS.sketches) {
        blocked = true;
        return current;
      }
      const next = submit ? { ...item, askedReview: true, reviewReply: note, updatedAt: new Date().toISOString() } : item;
      const submissions =
        submit && next.imageDataUrl && current.submissions.length < LIMITS.submissions
          ? [
              {
                id: next.id,
                title: next.title,
                description: next.description || "A private piece from The Sketchbook.",
                category: toArtCategory(next.category),
                imageDataUrl: next.imageDataUrl,
                createdAt: next.createdAt,
              },
              ...current.submissions,
            ]
          : current.submissions;
      return { ...current, sketches: [next, ...current.sketches], submissions };
    });
    if (blocked) {
      setBusy(false);
      setError(`You can keep ${LIMITS.sketches} sketchbook pieces on this device. Remove one from My Creations first.`);
      return;
    }
    setBusy(false);
    if (!result.ok) {
      setError(result.message ?? "This browser could not store that image.");
      return;
    }
    router.push(`/sketchbook/creations/${item.id}?saved=1`);
  }

  return (
    <div className="wrap page sketchbook">
      <header className="page-header">
        <p className="eyebrow">From paper or another app</p>
        <h1>Upload Artwork</h1>
        <p className="lede">PNG, JPEG, and WebP images can be previewed here. The file stays in this browser.</p>
        <Link className="btn quiet" href="/sketchbook">
          Back to The Sketchbook
        </Link>
      </header>
      {error ? <Notice tone="error">{error}</Notice> : null}
      <form
        className="card stack"
        onSubmit={(event) => {
          event.preventDefault();
          void save(false);
        }}
      >
        <div>
          <label htmlFor="sketch-file">Image</label>
          <input
            id="sketch-file"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(event) => void choose(event.target.files?.[0] ?? null)}
          />
        </div>
        {preview ? (
          <figure className="preview-frame">
            <img src={preview} alt="Preview of the selected artwork" />
            <figcaption className="cluster">
              <button
                type="button"
                className="btn"
                onClick={() => {
                  setFile(null);
                  setStored("");
                  const input = document.getElementById("sketch-file") as HTMLInputElement | null;
                  if (input) input.value = "";
                }}
              >
                Remove image
              </button>
              <label className="btn">
                Replace image
                <input
                  className="sr-only"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(event) => void choose(event.target.files?.[0] ?? null)}
                />
              </label>
            </figcaption>
          </figure>
        ) : null}
        <div>
          <label htmlFor="upload-title">Title</label>
          <input id="upload-title" value={title} maxLength={SKETCH_LIMITS.title} onChange={(event) => setTitle(event.target.value)} />
        </div>
        <div>
          <label htmlFor="upload-description">Description, optional</label>
          <textarea
            id="upload-description"
            value={description}
            maxLength={SKETCH_LIMITS.description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>
        <div>
          <label htmlFor="upload-category">Category</label>
          <select id="upload-category" value={category} onChange={(event) => setCategory(event.target.value as SketchCategory)}>
            {SKETCH_CATEGORIES.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>
        <div className="cluster">
          <button className="btn primary" type="submit" disabled={busy}>
            Save on this device
          </button>
          <button className="btn" type="button" disabled={busy} onClick={() => void save(true)}>
            {busy ? "Asking…" : "Submit to Art Hub"}
          </button>
          <Link className="btn quiet" href="/sketchbook">
            Cancel
          </Link>
        </div>
        <p className="hint">
          Nothing is uploaded to a server. Submit to Art Hub only asks the closed publication check, then keeps the
          piece as a private draft.
        </p>
      </form>
    </div>
  );
}
