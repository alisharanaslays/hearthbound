"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { GENRES } from "@/lib/genres";
import type { SiteBook } from "@/lib/site";
import { ConfirmButton, Notice } from "../ui";
import { deskSend } from "./desk";

const empty = { title: "", author: "", genre: "", pages: "200", blurb: "", featured: false };

export function BookDesk({ books, genres }: { books: SiteBook[]; genres: string[] }) {
  const router = useRouter();
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState<string | null>(null);
  const [genreName, setGenreName] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");
  const [pending, setPending] = useState(false);

  function beginEdit(book: SiteBook) {
    setEditing(book.id);
    setForm({
      title: book.title,
      author: book.author,
      genre: book.genre,
      pages: String(book.pages),
      blurb: book.blurb,
      featured: book.featured,
    });
    setError("");
    setSaved("");
    document.getElementById("book-desk")?.scrollIntoView({ block: "start" });
  }

  async function saveBook(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    setSaved("");
    const payload = {
      id: editing ?? undefined,
      title: form.title,
      author: form.author,
      genre: form.genre,
      pages: Number(form.pages),
      blurb: form.blurb,
      featured: form.featured,
    };
    const result = await deskSend("/api/admin/books", editing ? "PUT" : "POST", payload);
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setForm(empty);
    setEditing(null);
    setSaved(editing ? "Book updated." : "Book added to the public list.");
    router.refresh();
  }

  async function remove(id: string) {
    const result = await deskSend(`/api/admin/books?id=${encodeURIComponent(id)}`, "DELETE");
    if (!result.ok) {
      setError(result.error);
      return;
    }
    if (editing === id) {
      setEditing(null);
      setForm(empty);
    }
    setSaved("Book removed. Notes attached to it were removed too.");
    router.refresh();
  }

  async function addGenreName(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSaved("");
    const result = await deskSend("/api/admin/books", "POST", { kind: "genre", name: genreName });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setGenreName("");
    setSaved("Genre added. It can be used on new books and on reading shelves.");
    router.refresh();
  }

  async function removeGenre(name: string) {
    const result = await deskSend(`/api/admin/books?genre=${encodeURIComponent(name)}`, "DELETE");
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSaved(`Removed the genre ${name}.`);
    router.refresh();
  }

  const originals = new Set<string>(GENRES);

  return (
    <div>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {saved ? <Notice tone="good">{saved}</Notice> : null}
      <form id="book-desk" className="card" onSubmit={saveBook} noValidate>
        <h2>{editing ? "Edit book" : "Add a book"}</h2>
        <p className="hint">These titles appear on the homepage and in My Reading suggestions. They are not someone’s private shelf.</p>
        <div className="grid-2">
          <div className="field">
            <label htmlFor="desk-title">Title</label>
            <input id="desk-title" value={form.title} maxLength={120} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
          </div>
          <div className="field">
            <label htmlFor="desk-author">Author</label>
            <input id="desk-author" value={form.author} maxLength={120} onChange={(event) => setForm({ ...form, author: event.target.value })} required />
          </div>
        </div>
        <div className="grid-2">
          <div className="field">
            <label htmlFor="desk-genre">Genre</label>
            <select id="desk-genre" value={form.genre} onChange={(event) => setForm({ ...form, genre: event.target.value })} required>
              <option value="">Choose a genre</option>
              {genres.map((genre) => (
                <option key={genre} value={genre}>
                  {genre}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="desk-pages">Pages</label>
            <input
              id="desk-pages"
              inputMode="numeric"
              value={form.pages}
              onChange={(event) => setForm({ ...form, pages: event.target.value })}
              required
            />
          </div>
        </div>
        <div className="field">
          <label htmlFor="desk-blurb">Blurb</label>
          <textarea id="desk-blurb" rows={3} maxLength={280} value={form.blurb} onChange={(event) => setForm({ ...form, blurb: event.target.value })} />
        </div>
        <label className="check">
          <input type="checkbox" checked={form.featured} onChange={(event) => setForm({ ...form, featured: event.target.checked })} />
          <span>Show on the homepage</span>
        </label>
        <div className="cluster">
          <button className="btn primary" type="submit" disabled={pending}>
            {pending ? "Saving…" : editing ? "Save book" : "Add book"}
          </button>
          {editing ? (
            <button
              className="btn quiet"
              type="button"
              onClick={() => {
                setEditing(null);
                setForm(empty);
              }}
            >
              Cancel edit
            </button>
          ) : null}
        </div>
      </form>

      <section className="section" aria-labelledby="book-list-heading">
        <h2 id="book-list-heading">On the public list ({books.length})</h2>
        {books.length === 0 ? <p>The public list is empty. Add a book when you have one to suggest.</p> : null}
        <div className="stack">
          {books.map((book) => (
            <article key={book.id} className="card desk-row">
              <div>
                <h3>{book.title}</h3>
                <p className="meta">
                  {book.author} · {book.genre} · {book.pages} pages
                  {book.featured ? " · Homepage" : ""}
                </p>
                <p>{book.blurb}</p>
              </div>
              <div className="cluster">
                <button type="button" className="btn" onClick={() => beginEdit(book)}>
                  Edit
                </button>
                <ConfirmButton
                  label="Remove"
                  prompt={`Remove ${book.title}?`}
                  confirmLabel="Yes, remove"
                  onConfirm={() => void remove(book.id)}
                />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="card" aria-labelledby="genre-heading">
        <h2 id="genre-heading">Extra genres</h2>
        <p className="hint">The original genres stay, because the covers know their colors. Extra genres use a simple cover.</p>
        <form onSubmit={addGenreName} className="cluster">
          <div className="field" style={{ flex: "1 1 16rem", margin: 0 }}>
            <label htmlFor="new-genre">New genre</label>
            <input id="new-genre" value={genreName} maxLength={32} onChange={(event) => setGenreName(event.target.value)} />
          </div>
          <button className="btn" type="submit">
            Add genre
          </button>
        </form>
        <div className="chips" style={{ marginTop: "1rem" }}>
          {genres.map((genre) =>
            originals.has(genre) ? (
              <span key={genre} className="chip">
                {genre}
              </span>
            ) : (
              <ConfirmButton key={genre} label={`${genre} · remove`} prompt={`Remove ${genre}?`} confirmLabel="Remove genre" onConfirm={() => void removeGenre(genre)} />
            ),
          )}
        </div>
      </section>
    </div>
  );
}
