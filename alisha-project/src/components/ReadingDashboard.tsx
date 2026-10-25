"use client";

import { useEffect, useState, type FormEvent } from "react";
import { isRealDate, prettyDate, todayISO } from "@/lib/dates";
import { recommendBooks } from "@/lib/recommend";
import { buildSampleShelf } from "@/lib/sample-shelf";
import { LIMITS } from "@/lib/storage";
import { finishedInYear, monthPoints, pagesLoggedInYear, pagesRecorded, yearPoints } from "@/lib/stats";
import type { SiteReview } from "@/lib/site";
import type { Book, BookDraft, CatalogBook, ReadingStatus } from "@/lib/types";
import { useStore } from "@/lib/use-store";
import { statusLabel } from "@/lib/validate";
import { BookCover } from "./BookCover";
import { BookForm } from "./BookForm";
import { Chart } from "./Chart";
import { EmptyShelf } from "./Scenes";
import { ConfirmButton, Notice } from "./ui";
import { PageHeader } from "./PageHeader";

type Filter = "all" | ReadingStatus;

function sortBooks(books: Book[], filter: Filter) {
  const list = filter === "all" ? books : books.filter((book) => book.status === filter);
  return [...list].sort((a, b) => {
    if (filter === "completed") return (b.finishedOn ?? "").localeCompare(a.finishedOn ?? "");
    return b.createdAt.localeCompare(a.createdAt);
  });
}

export function ReadingDashboard({
  catalog,
  genres,
  notes,
}: {
  catalog: CatalogBook[];
  genres: string[];
  notes: SiteReview[];
}) {
  const { store, ready, update, notice, setNotice } = useStore();
  const [filter, setFilter] = useState<Filter>("all");
  const [formMode, setFormMode] = useState<"new" | string | null>(null);
  const [saved, setSaved] = useState("");
  const [range, setRange] = useState<"month" | "year">("month");
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({});
  const [goalBooks, setGoalBooks] = useState("");
  const [goalPages, setGoalPages] = useState("");
  const [goalError, setGoalError] = useState("");
  const [goalsReady, setGoalsReady] = useState(false);
  const year = new Date().getFullYear();

  useEffect(() => {
    if (!store || goalsReady) return;
    if (store.goals.year === year) {
      setGoalBooks(store.goals.books ? String(store.goals.books) : "");
      setGoalPages(store.goals.pages ? String(store.goals.pages) : "");
    }
    setGoalsReady(true);
  }, [store, goalsReady, year]);

  useEffect(() => {
    if (formMode) document.getElementById("book-form")?.scrollIntoView({ block: "start" });
  }, [formMode]);

  if (!ready || !store) {
    return (
      <div className="wrap page">
        <p role="status">Opening your shelf…</p>
      </div>
    );
  }

  const books = store.books;
  const visible = sortBooks(books, filter);
  const editing = books.find((book) => book.id === formMode);
  const hasSamples = books.some((book) => book.sample);
  const finishedYear = finishedInYear(books, year).length;
  const pagesYear = pagesLoggedInYear(books, year);
  const suggestions = recommendBooks(catalog, books, store.favoriteGenres);
  const personalized = store.favoriteGenres.length > 0 || books.length > 0;

  function saveDraft(draft: BookDraft) {
    if (editing) {
      const delta = draft.pagesRead - editing.pagesRead;
      const at = draft.finishedOn || todayISO();
      update((current) => ({
        ...current,
        books: current.books.map((book) =>
          book.id === editing.id
            ? {
                ...book,
                ...draft,
                sample: false,
                progressLog: delta > 0 ? [...book.progressLog, { at, delta }] : book.progressLog,
              }
            : book,
        ),
      }));
      setSaved(`Saved changes to ${draft.title.trim()}.`);
    } else {
      if (books.length >= LIMITS.books) {
        setNotice(`Your shelf holds ${LIMITS.books} books. Remove one before adding another.`);
        return;
      }
      const at = draft.status === "completed" ? draft.finishedOn || todayISO() : draft.startedOn || todayISO();
      update((current) => ({
        ...current,
        books: [
          {
            ...draft,
            id: crypto.randomUUID(),
            title: draft.title.trim(),
            author: draft.author.trim(),
            progressLog: draft.pagesRead > 0 ? [{ at, delta: draft.pagesRead }] : [],
            createdAt: new Date().toISOString(),
          },
          ...current.books,
        ],
      }));
      setSaved(`Added ${draft.title.trim()} to this device.`);
    }
    setFormMode(null);
  }

  function patch(book: Book, next: Partial<Book>, log?: { at: string; delta: number }) {
    update((current) => ({
      ...current,
      books: current.books.map((item) =>
        item.id === book.id
          ? {
              ...item,
              ...next,
              sample: false,
              progressLog: log && log.delta > 0 ? [...item.progressLog, log] : item.progressLog,
            }
          : item,
      ),
    }));
  }

  function addSamples() {
    const existing = new Set(books.map((book) => book.id));
    const additions = buildSampleShelf().filter((book) => !existing.has(book.id));
    if (books.length + additions.length > LIMITS.books) {
      setNotice("There is not enough room on the shelf for the sample books.");
      return;
    }
    update((current) => ({ ...current, books: [...additions, ...current.books] }));
    setSaved("Sample books are on your shelf. You can remove them whenever you like.");
  }

  function addCatalog(item: CatalogBook) {
    if (books.some((book) => book.title.trim().toLowerCase() === item.title.toLowerCase())) return;
    if (books.length >= LIMITS.books) {
      setNotice(`Your shelf holds ${LIMITS.books} books. Remove one before adding another.`);
      return;
    }
    update((current) => ({
      ...current,
      books: [
        {
          id: crypto.randomUUID(),
          title: item.title,
          author: item.author,
          genre: item.genre,
          totalPages: item.pages,
          pagesRead: 0,
          status: "planned",
          progressLog: [],
          createdAt: new Date().toISOString(),
        },
        ...current.books,
      ],
    }));
    setSaved(`Added ${item.title} to your planned shelf.`);
  }

  function saveGoals(event: FormEvent) {
    event.preventDefault();
    const bookText = goalBooks.trim();
    const pageText = goalPages.trim();
    const invalid =
      (bookText && !/^\d+$/.test(bookText)) ||
      (pageText && !/^\d+$/.test(pageText)) ||
      (bookText && (Number(bookText) < 1 || Number(bookText) > 500)) ||
      (pageText && (Number(pageText) < 1 || Number(pageText) > 200000));
    if (invalid) {
      setGoalError("Use a book goal from 1 to 500, and a page goal from 1 to 200,000. Leave a field blank to skip it.");
      return;
    }
    setGoalError("");
    update((current) => ({
      ...current,
      goals: {
        year,
        books: bookText ? Number(bookText) : undefined,
        pages: pageText ? Number(pageText) : undefined,
      },
    }));
    setSaved("Saved your reading goals on this device.");
  }

  const monthBooks = monthPoints(books, year, "books");
  const monthPages = monthPoints(books, year, "pages");
  const yearBooks = yearPoints(books, year, "books");
  const yearPages = yearPoints(books, year, "pages");

  return (
    <div className="wrap page">
      <PageHeader
        eyebrow="Private to this browser"
        title="My Reading"
        lede="A shelf for the books you plan, the ones open beside you, and the ones you have finished. No scores are shared. No one else can see this list."
      />
      {notice ? <Notice tone="error">{notice}</Notice> : null}
      {saved ? <Notice tone="good">{saved}</Notice> : null}

      {formMode ? (
        <BookForm
          key={editing?.id ?? "new"}
          heading={editing ? `Edit ${editing.title}` : "Add a book"}
          submitLabel={editing ? "Save changes" : "Save book"}
          genres={genres}
          initial={
            editing
              ? {
                  title: editing.title,
                  author: editing.author,
                  genre: editing.genre,
                  totalPages: editing.totalPages,
                  pagesRead: editing.pagesRead,
                  status: editing.status,
                  startedOn: editing.startedOn,
                  finishedOn: editing.finishedOn,
                  coverDataUrl: editing.coverDataUrl,
                }
              : undefined
          }
          onCancel={() => setFormMode(null)}
          onSave={saveDraft}
        />
      ) : null}

      <section className="section" aria-labelledby="goals-heading">
        <h2 id="goals-heading">Reading goals</h2>
        <p className="lede">Optional, and only for you. A hope is not a deadline.</p>
        {store.goals.year !== year ? (
          <Notice>
            Goals on this device were saved for {store.goals.year}. This year is {year}. Saving below starts a fresh hope for {year}.
          </Notice>
        ) : null}
        <div className="grid-2">
          <GoalMeter label={`Books finished in ${year}`} value={finishedYear} goal={store.goals.year === year ? store.goals.books : undefined} unit="books" />
          <GoalMeter label={`Pages logged in ${year}`} value={pagesYear} goal={store.goals.year === year ? store.goals.pages : undefined} unit="pages" />
        </div>
        <form className="card" style={{ marginTop: "1rem" }} onSubmit={saveGoals} noValidate>
          {goalError ? <Notice tone="error">{goalError}</Notice> : null}
          <div className="grid-2">
            <div className="field">
              <label htmlFor="goal-books">Books I hope to finish in {year}</label>
              <input id="goal-books" inputMode="numeric" value={goalBooks} onChange={(event) => setGoalBooks(event.target.value)} onWheel={(event) => event.currentTarget.blur()} />
            </div>
            <div className="field">
              <label htmlFor="goal-pages">Pages I hope to log in {year}</label>
              <input id="goal-pages" inputMode="numeric" value={goalPages} onChange={(event) => setGoalPages(event.target.value)} onWheel={(event) => event.currentTarget.blur()} />
            </div>
          </div>
          <div className="cluster">
            <button className="btn primary" type="submit">Save goals</button>
            <button
              className="btn quiet"
              type="button"
              onClick={() => {
                setGoalBooks("");
                setGoalPages("");
                setGoalError("");
                update((current) => ({ ...current, goals: { year } }));
                setSaved("Cleared your goals for this year.");
              }}
            >
              Clear goals
            </button>
          </div>
        </form>
      </section>

      <section className="section" aria-labelledby="shelf-heading">
        <div className="cluster" style={{ justifyContent: "space-between" }}>
          <h2 id="shelf-heading">Your shelf</h2>
          <div className="cluster">
            <button type="button" className="btn primary" onClick={() => setFormMode("new")}>
              Add a book
            </button>
            <button type="button" className="btn" onClick={addSamples}>
              Add a few sample books
            </button>
            {hasSamples ? (
              <button
                type="button"
                className="btn quiet"
                onClick={() => {
                  update((current) => ({ ...current, books: current.books.filter((book) => !book.sample) }));
                  setSaved("Removed the untouched sample books.");
                }}
              >
                Remove sample books
              </button>
            ) : null}
          </div>
        </div>
        <p className="meta">Saved in this browser only. {books.length} of {LIMITS.books} spaces used.</p>
        <div className="stat-grid" style={{ margin: "1rem 0" }}>
          <article className="card stat"><strong>{books.filter((book) => book.status === "reading").length}</strong> Reading now</article>
          <article className="card stat"><strong>{finishedYear}</strong> Finished in {year}</article>
          <article className="card stat"><strong>{pagesYear}</strong> Pages logged this year</article>
          <article className="card stat"><strong>{pagesRecorded(books)}</strong> Pages on the shelf</article>
        </div>
        <div className="segment" role="group" aria-label="Filter your shelf">
          {(["all", "reading", "planned", "completed"] as const).map((key) => (
            <button key={key} type="button" aria-pressed={filter === key} onClick={() => setFilter(key)}>
              {key === "all" ? "All" : statusLabel(key)} ({key === "all" ? books.length : books.filter((book) => book.status === key).length})
            </button>
          ))}
        </div>
        {books.length === 0 ? (
          <div className="card empty" style={{ marginTop: "1rem" }}>
            <EmptyShelf />
            <h3>Your shelf is waiting.</h3>
            <p>Add a title, or try the sample books to see progress, goals, and the charts.</p>
          </div>
        ) : visible.length === 0 ? (
          <p className="card" style={{ marginTop: "1rem" }}>Nothing in this group yet.</p>
        ) : (
          <div className="book-list" style={{ marginTop: "1rem" }}>
            {visible.map((book) => {
              const pct = book.totalPages ? Math.round((book.pagesRead / book.totalPages) * 100) : 0;
              return (
                <article key={book.id} className="card book-card">
                  <BookCover title={book.title} author={book.author} genre={book.genre} image={book.coverDataUrl} />
                  <div>
                    <div className="cluster">
                      <h3>{book.title}</h3>
                      <span className={`pill ${book.status}`}>{statusLabel(book.status)}</span>
                      {book.sample ? <span className="pill">Sample</span> : null}
                      {book.favorite ? <span className="pill">Favorite</span> : null}
                    </div>
                    <p className="meta">{book.author} · {book.genre}</p>
                    <p className="meta">
                      {book.pagesRead} of {book.totalPages} pages
                      {book.startedOn ? ` · Started ${prettyDate(book.startedOn)}` : ""}
                      {book.finishedOn ? ` · Finished ${prettyDate(book.finishedOn)}` : ""}
                    </p>
                    <div
                      className="track"
                      role="progressbar"
                      aria-valuemin={0}
                      aria-valuemax={book.totalPages}
                      aria-valuenow={book.pagesRead}
                      aria-label={`Pages read in ${book.title}`}
                    >
                      <span style={{ width: `${pct}%` }} />
                    </div>
                    {book.status !== "completed" ? (
                      <form
                        className="cluster"
                        onSubmit={(event) => {
                          event.preventDefault();
                          const data = new FormData(event.currentTarget);
                          const pages = Number(data.get("pages"));
                          const at = String(data.get("at") || "");
                          if (!Number.isInteger(pages) || pages < 0 || pages > book.totalPages) {
                            setCardErrors((current) => ({ ...current, [book.id]: `Enter a whole number from 0 to ${book.totalPages}.` }));
                            return;
                          }
                          if (book.status === "reading" && pages >= book.totalPages) {
                            setCardErrors((current) => ({ ...current, [book.id]: "Mark the book finished, or leave at least one page still to go." }));
                            return;
                          }
                          if (!isRealDate(at) || at > todayISO()) {
                            setCardErrors((current) => ({ ...current, [book.id]: "Choose today, or a real date in the past." }));
                            return;
                          }
                          setCardErrors((current) => ({ ...current, [book.id]: "" }));
                          patch(book, { pagesRead: pages }, { at, delta: pages - book.pagesRead });
                          setSaved(`Logged pages for ${book.title}.`);
                        }}
                      >
                        <label className="inline-field" htmlFor={`pages-${book.id}`}>
                          Pages read
                          <input id={`pages-${book.id}`} name="pages" inputMode="numeric" defaultValue={book.pagesRead} key={`${book.id}-${book.pagesRead}`} onWheel={(event) => event.currentTarget.blur()} />
                        </label>
                        <label className="inline-field" htmlFor={`at-${book.id}`}>
                          Logged on
                          <input id={`at-${book.id}`} name="at" type="date" defaultValue={todayISO()} max={todayISO()} />
                        </label>
                        <button className="btn" type="submit">Save progress</button>
                      </form>
                    ) : null}
                    {cardErrors[book.id] ? <p className="field-error">{cardErrors[book.id]}</p> : null}
                    <div className="cluster" style={{ marginTop: "0.7rem" }}>
                      {book.status === "planned" ? (
                        <button type="button" className="btn sage" onClick={() => patch(book, { status: "reading", startedOn: book.startedOn || todayISO() })}>
                          Start reading
                        </button>
                      ) : null}
                      {book.status === "reading" ? (
                        <button
                          type="button"
                          className="btn sage"
                          onClick={() => {
                            const today = todayISO();
                            patch(
                              book,
                              { status: "completed", pagesRead: book.totalPages, startedOn: book.startedOn || today, finishedOn: today },
                              { at: today, delta: book.totalPages - book.pagesRead },
                            );
                            setSaved(`Marked ${book.title} finished.`);
                          }}
                        >
                          Mark finished
                        </button>
                      ) : null}
                      <button
                        type="button"
                        className="btn"
                        aria-pressed={book.favorite === true}
                        onClick={() => patch(book, { favorite: !book.favorite })}
                      >
                        {book.favorite ? "Favorite" : "Mark as a favorite"}
                      </button>
                      <button type="button" className="btn quiet" onClick={() => setFormMode(book.id)}>
                        Edit
                      </button>
                      <ConfirmButton
                        label="Remove"
                        prompt={`Remove ${book.title}?`}
                        confirmLabel="Yes, remove"
                        onConfirm={() => {
                          update((current) => ({ ...current, books: current.books.filter((item) => item.id !== book.id) }));
                          setSaved(`Removed ${book.title}.`);
                        }}
                      />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="section" aria-labelledby="charts-heading">
        <h2 id="charts-heading">Your year on paper</h2>
        <p className="lede">These charts count only your own reading. Pages land on the day you log them. Finished books land in the month you mark them finished.</p>
        <div className="segment" role="group" aria-label="Chart range">
          <button type="button" aria-pressed={range === "month"} onClick={() => setRange("month")}>This year, by month</button>
          <button type="button" aria-pressed={range === "year"} onClick={() => setRange("year")}>By year</button>
        </div>
        <div className="grid-2" style={{ marginTop: "1rem" }}>
          <Chart points={range === "month" ? monthBooks : yearBooks} label={range === "month" ? `Books finished in ${year}` : "Books finished by year"} tone="books" unit="Books" />
          <Chart points={range === "month" ? monthPages : yearPages} label={range === "month" ? `Pages logged in ${year}` : "Pages logged by year"} tone="pages" unit="Pages" />
        </div>
      </section>

      <section className="section" id="suggestions" aria-labelledby="suggest-heading">
        <h2 id="suggest-heading">{personalized ? "Suggestions from your genres" : "Suggestions to start with"}</h2>
        <p className="lede">
          A curated list for this site, not a live book catalog. Finished books and favorites count a little more.
          Page counts are approximate.
        </p>
        <fieldset>
          <legend>Genres you want more of</legend>
          <div className="chips">
            {genres.map((genre) => {
              const on = store.favoriteGenres.includes(genre);
              return (
                <button
                  key={genre}
                  type="button"
                  className="chip"
                  aria-pressed={on}
                  onClick={() =>
                    update((current) => ({
                      ...current,
                      favoriteGenres: on
                        ? current.favoriteGenres.filter((item) => item !== genre)
                        : [...current.favoriteGenres, genre],
                    }))
                  }
                >
                  {genre}
                </button>
              );
            })}
          </div>
        </fieldset>
        {suggestions.length === 0 ? <p>The curated list is empty right now.</p> : null}
        <div className="grid-2">
          {suggestions.map(({ item, reason }) => {
            const owned = books.some((book) => book.title.trim().toLowerCase() === item.title.toLowerCase());
            return (
              <article key={item.id} className="card catalog-card">
                <div className="book-card">
                  <BookCover title={item.title} author={item.author} genre={item.genre} />
                  <div>
                    <h3>{item.title}</h3>
                    <p className="meta">{item.author} · {item.genre} · about {item.pages} pages</p>
                    <p>{item.blurb}</p>
                    {notes
                      .filter((note) => note.bookId === item.id)
                      .slice(0, 1)
                      .map((note) => (
                        <blockquote key={note.id} className="shelf-note">
                          <p>{note.quote}</p>
                          <footer>— {note.reviewer}</footer>
                        </blockquote>
                      ))}
                    <p className="hint">{reason}</p>
                    <button type="button" className="btn" disabled={owned} onClick={() => addCatalog(item)}>
                      {owned ? "Already on your shelf" : "Add to my shelf"}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function GoalMeter({ label, value, goal, unit }: { label: string; value: number; goal?: number; unit: string }) {
  const width = goal ? Math.min(100, Math.round((value / goal) * 100)) : 0;
  return (
    <article className="card">
      <h3>{label}</h3>
      <p>
        <strong>{value.toLocaleString()}</strong> {unit}
        {goal ? `. Your hope is ${goal.toLocaleString()}.` : ". No goal set."}
      </p>
      {goal && value > goal ? <p>You have passed that hope. Lovely.</p> : null}
      {goal ? (
        <div className="track goal-bar" role="progressbar" aria-valuemin={0} aria-valuemax={goal} aria-valuenow={Math.min(value, goal)} aria-label={label}>
          <span style={{ width: `${width}%` }} />
        </div>
      ) : null}
    </article>
  );
}
