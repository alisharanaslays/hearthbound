"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { SiteBook, SiteReview } from "@/lib/site";
import { ConfirmButton, Notice } from "../ui";
import { deskSend } from "./desk";

const empty = { bookId: "", reviewer: "", quote: "", visible: true };

export function ReviewDesk({ books, reviews }: { books: SiteBook[]; reviews: SiteReview[] }) {
  const router = useRouter();
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");
  const [pending, setPending] = useState(false);
  const titles = new Map(books.map((book) => [book.id, book.title]));

  function beginEdit(review: SiteReview) {
    setEditing(review.id);
    setForm({ bookId: review.bookId, reviewer: review.reviewer, quote: review.quote, visible: review.visible });
    setError("");
    setSaved("");
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    setSaved("");
    const result = await deskSend("/api/admin/reviews", editing ? "PUT" : "POST", { id: editing ?? undefined, ...form });
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setForm(empty);
    setEditing(null);
    setSaved(editing ? "Note updated." : "Note added.");
    router.refresh();
  }

  async function remove(id: string) {
    const result = await deskSend(`/api/admin/reviews?id=${encodeURIComponent(id)}`, "DELETE");
    if (!result.ok) {
      setError(result.error);
      return;
    }
    if (editing === id) {
      setEditing(null);
      setForm(empty);
    }
    setSaved("Note removed from the site.");
    router.refresh();
  }

  return (
    <div>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {saved ? <Notice tone="good">{saved}</Notice> : null}
      {books.length === 0 ? <Notice>Add a book before writing a note. Notes have to point at a book on the public list.</Notice> : null}
      <form className="card" onSubmit={save} noValidate>
        <h2>{editing ? "Edit a note" : "Write a note"}</h2>
        <p className="hint">These are your notes, shown with a nickname. Visitors cannot post reviews, and there is no score.</p>
        <div className="field">
          <label htmlFor="note-book">Book</label>
          <select id="note-book" value={form.bookId} onChange={(event) => setForm({ ...form, bookId: event.target.value })} required>
            <option value="">Choose a book</option>
            {books.map((book) => (
              <option key={book.id} value={book.id}>
                {book.title}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="note-name">Nickname</label>
          <input
            id="note-name"
            value={form.reviewer}
            maxLength={24}
            autoComplete="off"
            onChange={(event) => setForm({ ...form, reviewer: event.target.value })}
          />
          <p className="hint">A nickname only. Not an email, phone number, or real name you would not say aloud.</p>
        </div>
        <div className="field">
          <label htmlFor="note-quote">Note</label>
          <textarea id="note-quote" rows={4} maxLength={400} value={form.quote} onChange={(event) => setForm({ ...form, quote: event.target.value })} />
        </div>
        <label className="check">
          <input type="checkbox" checked={form.visible} onChange={(event) => setForm({ ...form, visible: event.target.checked })} />
          <span>Show this note on the site</span>
        </label>
        <div className="cluster">
          <button className="btn primary" type="submit" disabled={pending || books.length === 0}>
            {pending ? "Saving…" : editing ? "Save note" : "Add note"}
          </button>
          {editing ? (
            <button className="btn quiet" type="button" onClick={() => { setEditing(null); setForm(empty); }}>
              Cancel edit
            </button>
          ) : null}
        </div>
      </form>
      <section className="section" aria-labelledby="note-list-heading">
        <h2 id="note-list-heading">Notes ({reviews.length})</h2>
        {reviews.length === 0 ? <p>No notes yet.</p> : null}
        <div className="stack">
          {reviews.map((review) => (
            <article key={review.id} className="card">
              <p className="meta">{review.visible ? "Showing" : "Hidden"} · {titles.get(review.bookId) ?? "Missing book"}</p>
              <blockquote className="shelf-note">
                <p>{review.quote}</p>
                <footer>— {review.reviewer}</footer>
              </blockquote>
              <div className="cluster">
                <button type="button" className="btn" onClick={() => beginEdit(review)}>Edit</button>
                <ConfirmButton label="Remove" prompt="Remove this note?" confirmLabel="Yes, remove" onConfirm={() => void remove(review.id)} />
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
