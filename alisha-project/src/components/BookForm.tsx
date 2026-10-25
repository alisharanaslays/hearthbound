"use client";

import { useState, type FormEvent } from "react";
import { GENRES } from "@/lib/genres";
import { fileToJpeg } from "@/lib/images";
import type { BookDraft, ReadingStatus } from "@/lib/types";
import { validateBook } from "@/lib/validate";
import { todayISO } from "@/lib/dates";
import { BookCover } from "./BookCover";
import { Notice } from "./ui";

type FormState = {
  title: string;
  author: string;
  genre: string;
  totalPages: string;
  pagesRead: string;
  status: ReadingStatus;
  startedOn: string;
  finishedOn: string;
  coverDataUrl?: string;
};

const fieldIds: Record<string, string> = {
  title: "book-title",
  author: "book-author",
  genre: "book-genre",
  totalPages: "book-total",
  pagesRead: "book-pages",
  status: "book-status",
  startedOn: "book-started",
  finishedOn: "book-finished",
};

export function BookForm({
  initial,
  heading,
  submitLabel,
  onCancel,
  onSave,
  genres = GENRES,
}: {
  initial?: BookDraft;
  heading: string;
  submitLabel: string;
  onCancel: () => void;
  onSave: (draft: BookDraft) => void;
  genres?: readonly string[];
}) {
  const [form, setForm] = useState<FormState>({
    title: initial?.title ?? "",
    author: initial?.author ?? "",
    genre: initial?.genre ?? "",
    totalPages: initial ? String(initial.totalPages) : "",
    pagesRead: initial ? String(initial.pagesRead) : "0",
    status: initial?.status ?? "planned",
    startedOn: initial?.startedOn ?? "",
    finishedOn: initial?.finishedOn ?? "",
    coverDataUrl: initial?.coverDataUrl,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [coverError, setCoverError] = useState("");
  const [busy, setBusy] = useState(false);
  const genreOptions = form.genre && !genres.includes(form.genre) ? [form.genre, ...genres] : genres;

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => {
      const next = { ...current, [key]: value };
      if (key === "status" && value === "completed") {
        next.pagesRead = next.totalPages || next.pagesRead;
        if (!next.finishedOn) next.finishedOn = todayISO();
      }
      if (key === "status" && value !== "completed") next.finishedOn = "";
      if (key === "totalPages" && next.status === "completed") next.pagesRead = String(value);
      return next;
    });
  }

  async function onCover(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setCoverError("");
    try {
      const coverDataUrl = await fileToJpeg(file);
      setForm((current) => ({ ...current, coverDataUrl }));
    } catch (error) {
      setCoverError(error instanceof Error ? error.message : "That image could not be used.");
    } finally {
      setBusy(false);
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const draft: BookDraft = {
      title: form.title,
      author: form.author,
      genre: form.genre,
      totalPages: Number(form.totalPages),
      pagesRead: form.status === "completed" ? Number(form.totalPages) : Number(form.pagesRead),
      status: form.status,
      startedOn: form.startedOn || undefined,
      finishedOn: form.status === "completed" ? form.finishedOn || undefined : undefined,
      coverDataUrl: form.coverDataUrl,
    };
    const nextErrors = validateBook(draft, genreOptions);
    setErrors(nextErrors);
    const first = Object.keys(nextErrors)[0];
    if (first) {
      document.getElementById(fieldIds[first] ?? "")?.focus();
      return;
    }
    onSave(draft);
  }

  const errorCount = Object.keys(errors).length;

  return (
    <form id="book-form" className="card" onSubmit={submit} noValidate>
      <h2>{heading}</h2>
      {errorCount > 0 ? (
        <Notice tone="error">
          Please fix {errorCount === 1 ? "one field" : `${errorCount} fields`} before saving.
        </Notice>
      ) : null}
      <div className="grid-2">
        <div className="field">
          <label htmlFor="book-title">Title</label>
          <input
            id="book-title"
            value={form.title}
            maxLength={120}
            onChange={(event) => update("title", event.target.value)}
            aria-invalid={Boolean(errors.title)}
            aria-describedby={errors.title ? "book-title-error" : undefined}
            required
          />
          {errors.title ? <p id="book-title-error" className="field-error">{errors.title}</p> : null}
        </div>
        <div className="field">
          <label htmlFor="book-author">Author</label>
          <input
            id="book-author"
            value={form.author}
            maxLength={120}
            onChange={(event) => update("author", event.target.value)}
            aria-invalid={Boolean(errors.author)}
            aria-describedby={errors.author ? "book-author-error" : undefined}
            required
          />
          {errors.author ? <p id="book-author-error" className="field-error">{errors.author}</p> : null}
        </div>
      </div>
      <div className="grid-2">
        <div className="field">
          <label htmlFor="book-genre">Genre</label>
          <select
            id="book-genre"
            value={form.genre}
            onChange={(event) => update("genre", event.target.value)}
            aria-invalid={Boolean(errors.genre)}
            aria-describedby={errors.genre ? "book-genre-error" : undefined}
          >
            <option value="">Choose a genre</option>
            {genreOptions.map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>
          {errors.genre ? <p id="book-genre-error" className="field-error">{errors.genre}</p> : null}
        </div>
        <div className="field">
          <label htmlFor="book-status">Status</label>
          <select
            id="book-status"
            value={form.status}
            onChange={(event) => update("status", event.target.value as ReadingStatus)}
          >
            <option value="planned">Planned</option>
            <option value="reading">Reading</option>
            <option value="completed">Finished</option>
          </select>
        </div>
      </div>
      <div className="grid-2">
        <div className="field">
          <label htmlFor="book-total">Total pages</label>
          <input
            id="book-total"
            inputMode="numeric"
            value={form.totalPages}
            onChange={(event) => update("totalPages", event.target.value)}
            onWheel={(event) => event.currentTarget.blur()}
            aria-invalid={Boolean(errors.totalPages)}
            aria-describedby={errors.totalPages ? "book-total-error" : undefined}
          />
          {errors.totalPages ? <p id="book-total-error" className="field-error">{errors.totalPages}</p> : null}
        </div>
        <div className="field">
          <label htmlFor="book-pages">Pages read</label>
          <input
            id="book-pages"
            inputMode="numeric"
            value={form.pagesRead}
            disabled={form.status === "completed"}
            onChange={(event) => update("pagesRead", event.target.value)}
            onWheel={(event) => event.currentTarget.blur()}
            aria-invalid={Boolean(errors.pagesRead)}
            aria-describedby={errors.pagesRead ? "book-pages-error" : "book-pages-hint"}
          />
          <p id="book-pages-hint" className="hint">
            {form.status === "completed" ? "Finished books use the full page count." : "You can update this again from the shelf."}
          </p>
          {errors.pagesRead ? <p id="book-pages-error" className="field-error">{errors.pagesRead}</p> : null}
        </div>
      </div>
      <div className="grid-2">
        <div className="field">
          <label htmlFor="book-started">Date started</label>
          <input
            id="book-started"
            type="date"
            value={form.startedOn}
            max={todayISO()}
            onChange={(event) => update("startedOn", event.target.value)}
            aria-invalid={Boolean(errors.startedOn)}
            aria-describedby={errors.startedOn ? "book-started-error" : "book-started-hint"}
          />
          <p id="book-started-hint" className="hint">Needed once a book is reading or finished.</p>
          {errors.startedOn ? <p id="book-started-error" className="field-error">{errors.startedOn}</p> : null}
        </div>
        {form.status === "completed" ? (
          <div className="field">
            <label htmlFor="book-finished">Date finished</label>
            <input
              id="book-finished"
              type="date"
              value={form.finishedOn}
              max={todayISO()}
              onChange={(event) => update("finishedOn", event.target.value)}
              aria-invalid={Boolean(errors.finishedOn)}
              aria-describedby={errors.finishedOn ? "book-finished-error" : undefined}
            />
            {errors.finishedOn ? <p id="book-finished-error" className="field-error">{errors.finishedOn}</p> : null}
          </div>
        ) : null}
      </div>
      <div className="field">
        <label htmlFor="book-cover">Cover image, optional</label>
        <input
          id="book-cover"
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          onChange={(event) => onCover(event.target.files?.[0])}
        />
        <p className="hint">If you skip this, Hearthbound draws a cover from the title and genre. Images stay on this device.</p>
        {coverError ? <p className="field-error">{coverError}</p> : null}
      </div>
      {form.title ? (
        <BookCover title={form.title} author={form.author || "Author"} genre={form.genre || "Fantasy"} image={form.coverDataUrl} />
      ) : null}
      {form.coverDataUrl ? (
        <button type="button" className="btn quiet" onClick={() => setForm((current) => ({ ...current, coverDataUrl: undefined }))}>
          Remove cover image
        </button>
      ) : null}
      <div className="cluster" style={{ marginTop: "1rem" }}>
        <button className="btn primary" type="submit" disabled={busy}>
          {busy ? "Preparing image…" : submitLabel}
        </button>
        <button className="btn quiet" type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
