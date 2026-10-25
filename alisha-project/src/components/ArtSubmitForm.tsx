"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { ART_CATEGORIES, MOTIF_CHOICES } from "@/lib/art";
import { fileToJpeg } from "@/lib/images";
import { LIMITS } from "@/lib/storage";
import type { ArtCategory, MotifId } from "@/lib/types";
import { useStore } from "@/lib/use-store";
import { validateArt } from "@/lib/validate";
import { ArtworkMotif } from "./ArtworkMotif";
import { PageHeader } from "./PageHeader";
import { Notice } from "./ui";

export function ArtSubmitForm() {
  const { store, ready, update } = useStore();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [inspiration, setInspiration] = useState("");
  const [category, setCategory] = useState<string>("");
  const [motif, setMotif] = useState<string>("");
  const [image, setImage] = useState<string | undefined>();
  const [acknowledged, setAcknowledged] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [imageError, setImageError] = useState("");
  const [result, setResult] = useState<{ title: string; server: string; stored: boolean } | null>(null);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setImageError("");
    try {
      setImage(await fileToJpeg(file));
    } catch (error) {
      setImage(undefined);
      setImageError(error instanceof Error ? error.message : "That image could not be used.");
    } finally {
      setBusy(false);
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    const nextErrors = validateArt({
      title,
      description,
      inspiration,
      category,
      hasImage: Boolean(image),
      motif,
      acknowledged,
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      const first = Object.keys(nextErrors)[0];
      document.getElementById(first === "image" ? "art-image" : `art-${first}`)?.focus();
      return;
    }
    if (!store || store.submissions.length >= LIMITS.submissions) {
      setErrors({ title: `You can keep ${LIMITS.submissions} private submissions on this device. Remove one from My Library first.` });
      return;
    }

    const savedTitle = title.trim();
    const saveResult = update((current) => ({
      ...current,
      submissions: [
        {
          id: crypto.randomUUID(),
          title: savedTitle,
          description: description.trim(),
          inspiration: inspiration.trim() || undefined,
          category: category as ArtCategory,
          imageDataUrl: image,
          motif: (motif || undefined) as MotifId | undefined,
          createdAt: new Date().toISOString(),
        },
        ...current.submissions,
      ],
    }));

    let server = "Saved on this device. The server could not be reached, so nothing was published.";
    try {
      const response = await fetch("/api/publications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "artwork" }),
      });
      const data = (await response.json()) as { reason?: string };
      server = data.reason ?? server;
    } catch {
      server = "Saved on this device. The server could not be reached, so nothing was published.";
    }
    if (!saveResult.ok) {
      setErrors({
        title: saveResult.message ?? "This browser could not store that artwork.",
      });
      return;
    }
    setResult({ title: savedTitle, server, stored: true });
  }

  if (!ready) {
    return (
      <div className="wrap page">
        <p role="status">Opening the submission form…</p>
      </div>
    );
  }

  if (result) {
    return (
      <div className="wrap page">
        <PageHeader eyebrow="Not public" title="Saved on this device" lede={`${result.title} is in My Library. It was not added to the gallery.`} />
        <Notice>{result.server}</Notice>
        <div className="cluster">
          <Link className="btn primary" href="/library">
            See it in My Library
          </Link>
          <button type="button" className="btn" onClick={() => {
            setResult(null);
            setTitle("");
            setDescription("");
            setInspiration("");
            setCategory("");
            setMotif("");
            setImage(undefined);
            setAcknowledged(false);
            setErrors({});
          }}>
            Submit another
          </button>
        </div>
      </div>
    );
  }

  const errorCount = Object.keys(errors).length;

  return (
    <div className="wrap page">
      <PageHeader
        eyebrow="Private draft"
        title="Submit artwork"
        lede="Eligible older artists will someday share original drawings after a real review. Today the form only saves a private copy in this browser. Do not upload someone else's work, personal information, or a real person's face. Safety screening is not running."
      />
      <form className="card" onSubmit={submit} noValidate>
        {errorCount > 0 ? (
          <Notice tone="error">Please fix {errorCount === 1 ? "one field" : `${errorCount} fields`} before saving.</Notice>
        ) : null}
        <div className="field">
          <label htmlFor="art-title">Title</label>
          <input id="art-title" value={title} maxLength={80} onChange={(event) => setTitle(event.target.value)} aria-invalid={Boolean(errors.title)} aria-describedby={errors.title ? "art-title-error" : undefined} />
          {errors.title ? <p id="art-title-error" className="field-error">{errors.title}</p> : null}
        </div>
        <div className="field">
          <label htmlFor="art-description">Description</label>
          <textarea id="art-description" value={description} maxLength={400} onChange={(event) => setDescription(event.target.value)} aria-invalid={Boolean(errors.description)} aria-describedby={errors.description ? "art-description-error" : undefined} />
          {errors.description ? <p id="art-description-error" className="field-error">{errors.description}</p> : null}
        </div>
        <div className="field">
          <label htmlFor="art-inspiration">Book inspiration, optional</label>
          <input id="art-inspiration" value={inspiration} maxLength={120} onChange={(event) => setInspiration(event.target.value)} aria-invalid={Boolean(errors.inspiration)} />
          <p className="hint">A title is enough. Skip plot details that are not yours to post.</p>
          {errors.inspiration ? <p className="field-error">{errors.inspiration}</p> : null}
        </div>
        <div className="field">
          <label htmlFor="art-category">Category</label>
          <select id="art-category" value={category} onChange={(event) => setCategory(event.target.value)} aria-invalid={Boolean(errors.category)}>
            <option value="">Choose a category</option>
            {ART_CATEGORIES.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          {errors.category ? <p className="field-error">{errors.category}</p> : null}
        </div>
        <div className="field">
          <label htmlFor="art-image">Artwork image</label>
          <input id="art-image" type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={(event) => onFile(event.target.files?.[0])} aria-invalid={Boolean(errors.image)} />
          <p className="hint">JPG, PNG, WEBP, or GIF, up to 8 MB. It is resized and stored only in this browser.</p>
          {imageError ? <p className="field-error">{imageError}</p> : null}
          {errors.image ? <p className="field-error">{errors.image}</p> : null}
        </div>
        {image ? <img src={image} alt="Your selected artwork preview" style={{ maxWidth: 280, borderRadius: 16 }} /> : null}
        <div className="field">
          <label htmlFor="art-motif">Or choose a placeholder motif</label>
          <select id="art-motif" value={motif} onChange={(event) => setMotif(event.target.value)}>
            <option value="">No placeholder</option>
            {MOTIF_CHOICES.map((item) => (
              <option key={item.id} value={item.id}>{item.label}</option>
            ))}
          </select>
          <p className="hint">Placeholders are for trying the form. They are labelled as samples, not as your drawing.</p>
        </div>
        {motif ? (
          <div className="frame" style={{ maxWidth: 240 }}>
            <ArtworkMotif motif={motif as MotifId} />
          </div>
        ) : null}
        <label className="check">
          <input id="art-acknowledged" type="checkbox" checked={acknowledged} onChange={(event) => setAcknowledged(event.target.checked)} aria-invalid={Boolean(errors.acknowledged)} />
          <span>I understand this stays on this device and is not published or reviewed.</span>
        </label>
        {errors.acknowledged ? <p className="field-error">{errors.acknowledged}</p> : null}
        <div className="cluster" style={{ marginTop: "1rem" }}>
          <button className="btn primary" type="submit" disabled={busy}>{busy ? "Preparing image…" : "Save privately"}</button>
          <Link className="btn quiet" href="/art">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
