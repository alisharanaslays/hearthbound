"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { LIMITS } from "@/lib/storage";
import type { LittleBookPage, PictureId } from "@/lib/types";
import { useStore } from "@/lib/use-store";
import { PageHeader } from "./PageHeader";
import { PICTURES, Picture } from "./Pictures";
import { Notice } from "./ui";

const emptyPage = (): LittleBookPage => ({ picture: "fox", text: "" });

export function LittleBookStudio({ creationId, justSaved }: { creationId: string | null; justSaved?: string | null }) {
  const router = useRouter();
  const { store, ready, update, notice } = useStore();
  const [title, setTitle] = useState("My little book");
  const [pages, setPages] = useState<LittleBookPage[]>([emptyPage(), emptyPage()]);
  const [index, setIndex] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(creationId);
  const [saved, setSaved] = useState("");
  const [error, setError] = useState("");
  const [speechNote, setSpeechNote] = useState("");
  const [canSpeak, setCanSpeak] = useState(false);

  useEffect(() => {
    setCanSpeak(typeof window.speechSynthesis !== "undefined");
    return () => window.speechSynthesis?.cancel();
  }, []);

  useEffect(() => {
    if (!store || !creationId) return;
    const existing = store.shelf.find((item) => item.id === creationId && item.kind === "book");
    if (existing && existing.kind === "book") {
      setTitle(existing.title);
      setPages(existing.pages);
      setEditingId(existing.id);
      setIndex(0);
    }
  }, [store, creationId]);

  const page = pages[index] ?? pages[0];

  function updatePage(patch: Partial<LittleBookPage>) {
    setPages((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)));
  }

  function readAloud() {
    const text = [title.trim(), ...pages.map((item) => item.text.trim())].filter(Boolean).join(". ");
    if (!text || !window.speechSynthesis) {
      setSpeechNote("Add a few words first.");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
    setSpeechNote("Reading aloud with this browser’s voice. Nothing is recorded or saved as audio.");
  }

  function save(event: FormEvent) {
    event.preventDefault();
    const nextTitle = title.trim();
    if (nextTitle.length < 2 || nextTitle.length > 40) {
      setError("Give the book a name, from 2 to 40 characters.");
      return;
    }
    if (pages.length === 0) {
      setError("Add at least one page.");
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
      return {
        ...current,
        shelf: [
          {
            id,
            kind: "book" as const,
            title: nextTitle,
            pages,
            createdAt: existing?.createdAt ?? now,
            updatedAt: now,
          },
          ...current.shelf.filter((item) => item.id !== id),
        ],
      };
    });
    setEditingId(id);
    setError("");
    setSaved(result.ok ? "Saved on your private shelf." : "The book is open for this visit, but the browser could not store it.");
    router.replace(`/cozy/book?id=${id}&saved=${result.ok ? "1" : "0"}`);
  }

  return (
    <div className="wrap page cozy">
      <PageHeader
        eyebrow="Prototype"
        title="Make a little book"
        lede="Choose a picture and type a line for each page. This maker does not bind a printed book, share with a parent, or keep a recording."
      >
        <Link className="btn quiet" href="/cozy">Back to Cozy Corner</Link>
      </PageHeader>
      {notice ? <Notice tone="error">{notice}</Notice> : null}
      {saved || justSaved === "1" ? <Notice tone="good">{saved || "Saved on your private shelf."}</Notice> : null}
      {!saved && justSaved === "0" ? <Notice tone="error">The book is open for this visit, but the browser could not store it.</Notice> : null}
      {error ? <Notice tone="error">{error}</Notice> : null}
      <div className="grid-2">
        <form className="no-print" onSubmit={save} noValidate>
          <div className="field">
            <label htmlFor="book-name">Book title</label>
            <input id="book-name" value={title} maxLength={40} onChange={(event) => setTitle(event.target.value)} />
          </div>
          <div className="segment" role="group" aria-label="Pages">
            {pages.map((_, pageIndex) => (
              <button key={pageIndex} type="button" aria-current={pageIndex === index ? "page" : undefined} aria-pressed={pageIndex === index} onClick={() => setIndex(pageIndex)}>
                Page {pageIndex + 1}
              </button>
            ))}
          </div>
          <fieldset>
            <legend>Picture for page {index + 1}</legend>
            <div className="picture-grid">
              {PICTURES.map((picture) => (
                <label key={picture.id} className="picture-option">
                  <input
                    type="radio"
                    name="picture"
                    value={picture.id}
                    checked={page.picture === picture.id}
                    onChange={() => updatePage({ picture: picture.id })}
                  />
                  <Picture id={picture.id} />
                  <span>{picture.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="field">
            <label htmlFor="page-text">Words for this page</label>
            <textarea
              id="page-text"
              maxLength={180}
              value={page.text}
              onChange={(event) => updatePage({ text: event.target.value })}
            />
            <p className="hint">{page.text.length} / 180</p>
          </div>
          <div className="cluster">
            <button
              type="button"
              className="btn"
              disabled={pages.length >= 6}
              onClick={() => {
                setPages((current) => [...current, emptyPage()]);
                setIndex(pages.length);
              }}
            >
              Add a page
            </button>
            <button
              type="button"
              className="btn quiet"
              disabled={pages.length <= 1}
              onClick={() => {
                setPages((current) => current.filter((_, pageIndex) => pageIndex !== index));
                setIndex((current) => Math.max(0, current - 1));
              }}
            >
              Remove this page
            </button>
            {canSpeak ? (
              <button type="button" className="btn" onClick={readAloud}>
                Read aloud
              </button>
            ) : (
              <p className="hint">Reading aloud is not available in this browser.</p>
            )}
            <button className="btn primary" type="submit" disabled={!ready}>
              Save to my private shelf
            </button>
            <button type="button" className="btn" onClick={() => window.print()}>
              Print
            </button>
          </div>
          {speechNote ? <p role="status">{speechNote}</p> : null}
          {canSpeak ? <p className="hint">Read aloud uses your browser’s voice. Speech is not recorded or stored.</p> : null}
        </form>
        <div>
          <h2>Your little book</h2>
          {pages.map((item, pageIndex) => (
            <article key={pageIndex} className="book-sheet" style={{ marginBottom: "0.8rem" }}>
              <p className="meta">Page {pageIndex + 1}</p>
              {pageIndex === 0 ? <h3>{title || "Untitled"}</h3> : null}
              <Picture id={item.picture as PictureId} />
              <p>{item.text || "…"}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
