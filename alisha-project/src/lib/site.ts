import { mkdir, readFile, rename, writeFile } from "fs/promises";
import path from "path";
import { CATALOG } from "./catalog";
import { GENRES } from "./genres";
import { validateNickname } from "./validate";
import type { CatalogBook } from "./types";

export type SiteTheme = {
  cream: string;
  ink: string;
  lavender: string;
  lavenderDeep: string;
  pink: string;
  pinkDeep: string;
  sage: string;
  sageDeep: string;
  blue: string;
  blueDeep: string;
  gold: string;
  radius: number;
};

export type SiteCopy = {
  siteName: string;
  motto: string;
  metaDescription: string;
  eyebrow: string;
  heroTitle: string;
  heroLede: string;
  primaryCta: string;
  secondaryCta: string;
  roomsHeading: string;
  roomReading: string;
  roomArt: string;
  roomCozy: string;
  roomStudio: string;
  roomLibrary: string;
  kindnessHeading: string;
  kindnessBody: string;
  startersHeading: string;
  startersLede: string;
  reviewsHeading: string;
  reviewsLede: string;
  honestHeading: string;
  honestBody: string;
  footerNote: string;
};

export type SiteBook = CatalogBook & { featured: boolean };

export type SiteReview = {
  id: string;
  bookId: string;
  reviewer: string;
  quote: string;
  visible: boolean;
};

export type SiteContent = {
  version: 1;
  copy: SiteCopy;
  theme: SiteTheme;
  extraGenres: string[];
  books: SiteBook[];
  reviews: SiteReview[];
};

const FILE = path.join(process.cwd(), "data", "content.json");
const LIMITS = { books: 60, reviews: 80, genres: 12 };

export function defaultTheme(): SiteTheme {
  return {
    cream: "#fbf6ee",
    ink: "#2a2420",
    lavender: "#e7dff6",
    lavenderDeep: "#4d3f6b",
    pink: "#f8dbe3",
    pinkDeep: "#7a3550",
    sage: "#e5f0e4",
    sageDeep: "#2f5a40",
    blue: "#dce8f6",
    blueDeep: "#1f4e79",
    gold: "#e7c98a",
    radius: 24,
  };
}

export function defaultCopy(): SiteCopy {
  return {
    siteName: "Hearthbound",
    motto: "Read. Create. Imagine. Belong.",
    metaDescription: "A cozy creative community for people who love books, art, and stories. Read. Create. Imagine. Belong.",
    eyebrow: "A cozy creative community",
    heroTitle: "Read. Create. Imagine. Belong.",
    heroLede:
      "Hearthbound is a warm little place for people who love books. Track what you read, wander a gallery of original art, and keep a gentle corner for coloring and tiny books. Kindness is part of the room. Popularity is not.",
    primaryCta: "Open my reading shelf",
    secondaryCta: "Wander the art hub",
    roomsHeading: "Rooms in the house",
    roomReading: "A private shelf, optional goals, and a record of pages that nobody else can rank.",
    roomArt: "A sample gallery today. Your own drawings stay unlisted until a real review exists.",
    roomCozy: "Color a page or stitch a tiny book. Made to feel calm for a younger child, with a grown-up nearby.",
    roomStudio: "Original tales, what-ifs, and chapters are planned. The room is not open yet.",
    roomLibrary: "A nickname, an illustrated avatar, and the controls for your own data.",
    kindnessHeading: "Kindness, on purpose",
    kindnessBody:
      "Encouragement uses a short list of prewritten notes, such as “Your imagination is wonderful!” and “There is no wrong way to imagine!” Everyone can send one. It is not a prize for being overlooked, and it is not a score.\n\nArtists may see their own private tally. Other people do not see the number, and nobody sees who sent a note.",
    startersHeading: "From the sample list",
    startersLede: "A few books to begin with. Suggestions on My Reading can follow the genres you choose.",
    reviewsHeading: "Shelf notes",
    reviewsLede: "Short notes written for this site. Visitors cannot post their own.",
    honestHeading: "Before this is a home for children",
    honestBody:
      "Hearthbound is a working prototype. It is not a claim of complete safety. Age assurance, parental consent, and human moderation are not built, and an age typed into a browser would not count as proof. Do not treat this site as ready for real children.\n\nPublic shelves, when they exist, will be separated for ages 14–15, 16–17, and adults, and the server will have to enforce that split. Younger children keep work private, with a later path to share only with a linked guardian.",
    footerNote:
      "A prototype for a cozy creative community. Reading shelves, artwork drafts, and coloring stay in this browser. Nothing here is a finished safety system.",
  };
}

function defaultBooks(): SiteBook[] {
  return CATALOG.map((book, index) => ({ ...book, featured: index < 3 }));
}

function defaultReviews(): SiteReview[] {
  return [
    {
      id: "note-hobbit",
      bookId: "hobbit",
      reviewer: "Moss",
      quote: "A walking book. I liked that the brave part was mostly going home.",
      visible: true,
    },
    {
      id: "note-charlotte",
      bookId: "charlotte",
      reviewer: "Pebble",
      quote: "I read the last page slowly, then sat with it.",
      visible: true,
    },
    {
      id: "note-prince",
      bookId: "prince",
      reviewer: "Lark",
      quote: "The questions stay after the story ends.",
      visible: true,
    },
  ];
}

export function defaultContent(): SiteContent {
  return {
    version: 1,
    copy: defaultCopy(),
    theme: defaultTheme(),
    extraGenres: [],
    books: defaultBooks(),
    reviews: defaultReviews(),
  };
}

export function allGenres(content: SiteContent) {
  const extras = content.extraGenres.filter((genre) => !(GENRES as readonly string[]).includes(genre));
  return [...GENRES, ...extras];
}

export function mottoParts(motto: string) {
  const parts = motto
    .split(/[·•|]+|(?<=\.)\s+/)
    .map((part) => part.replace(/\.+$/, "").trim())
    .filter(Boolean);
  return (parts.length ? parts : ["Read", "Create", "Imagine", "Belong"]).slice(0, 6);
}

export function paragraphs(value: string) {
  return value
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function hex(value: unknown, fallback: string) {
  if (typeof value !== "string") return fallback;
  return /^#[0-9a-fA-F]{6}$/.test(value.trim()) ? value.trim().toLowerCase() : fallback;
}

function text(value: unknown, max: number, fallback: string) {
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  if (!trimmed) return fallback;
  return trimmed.slice(0, max);
}

function clamp(value: unknown, min: number, max: number, fallback: number) {
  const number = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, Math.round(number)));
}

function slug(value: string) {
  const base = value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  return base || "book";
}

function uniqueId(title: string, used: Set<string>) {
  const base = slug(title);
  let id = base;
  let n = 2;
  while (used.has(id)) {
    id = `${base}-${n}`;
    n += 1;
  }
  return id;
}

function asBook(value: unknown, genres: Set<string>): SiteBook | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Partial<SiteBook>;
  const id = typeof raw.id === "string" && /^[a-z0-9-]{1,80}$/.test(raw.id) ? raw.id : "";
  const title = text(raw.title, 120, "");
  const author = text(raw.author, 120, "");
  const genre = text(raw.genre, 40, "");
  const blurb = text(raw.blurb, 280, "");
  const pages = clamp(raw.pages, 1, 20000, 0);
  if (!id || !title || !author || !genre || !blurb || !pages || !genres.has(genre)) return null;
  return { id, title, author, genre, pages, blurb, featured: raw.featured === true };
}

function asReview(value: unknown, bookIds: Set<string>): SiteReview | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Partial<SiteReview>;
  const id = typeof raw.id === "string" && /^[a-z0-9-]{1,80}$/.test(raw.id) ? raw.id : "";
  const bookId = typeof raw.bookId === "string" ? raw.bookId : "";
  const reviewer = text(raw.reviewer, 24, "");
  const quote = text(raw.quote, 400, "");
  if (!id || !bookIds.has(bookId) || validateNickname(reviewer) || quote.length < 8) return null;
  return { id, bookId, reviewer, quote, visible: raw.visible !== false };
}

export function normalize(value: unknown): SiteContent {
  const base = defaultContent();
  if (!value || typeof value !== "object") return base;
  const raw = value as Partial<SiteContent>;
  const copy = { ...base.copy };
  if (raw.copy && typeof raw.copy === "object") {
    for (const key of Object.keys(copy) as (keyof SiteCopy)[]) {
      const max = key.endsWith("Body") || key === "heroLede" || key === "footerNote" || key === "metaDescription" ? 900 : 180;
      copy[key] = text((raw.copy as SiteCopy)[key], max, copy[key]);
    }
  }
  const themeBase = base.theme;
  const themeIn = raw.theme && typeof raw.theme === "object" ? (raw.theme as Partial<SiteTheme>) : {};
  const theme: SiteTheme = {
    cream: hex(themeIn.cream, themeBase.cream),
    ink: hex(themeIn.ink, themeBase.ink),
    lavender: hex(themeIn.lavender, themeBase.lavender),
    lavenderDeep: hex(themeIn.lavenderDeep, themeBase.lavenderDeep),
    pink: hex(themeIn.pink, themeBase.pink),
    pinkDeep: hex(themeIn.pinkDeep, themeBase.pinkDeep),
    sage: hex(themeIn.sage, themeBase.sage),
    sageDeep: hex(themeIn.sageDeep, themeBase.sageDeep),
    blue: hex(themeIn.blue, themeBase.blue),
    blueDeep: hex(themeIn.blueDeep, themeBase.blueDeep),
    gold: hex(themeIn.gold, themeBase.gold),
    radius: clamp(themeIn.radius, 16, 40, themeBase.radius),
  };
  const extraGenres = Array.isArray(raw.extraGenres)
    ? [...new Set(raw.extraGenres.map((genre) => text(genre, 32, "")).filter((genre) => genre.length >= 2))].slice(0, LIMITS.genres)
    : [];
  const genres = new Set([...GENRES, ...extraGenres]);
  const books = Array.isArray(raw.books)
    ? raw.books.map((book) => asBook(book, genres)).filter((book): book is SiteBook => Boolean(book)).slice(0, LIMITS.books)
    : base.books;
  const bookIds = new Set(books.map((book) => book.id));
  const reviews = Array.isArray(raw.reviews)
    ? raw.reviews.map((review) => asReview(review, bookIds)).filter((review): review is SiteReview => Boolean(review)).slice(0, LIMITS.reviews)
    : base.reviews.filter((review) => bookIds.has(review.bookId));
  return { version: 1, copy, theme, extraGenres, books, reviews };
}

let queue: Promise<void> = Promise.resolve();

async function readFresh(): Promise<SiteContent> {
  try {
    const raw = await readFile(FILE, "utf8");
    return normalize(JSON.parse(raw));
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ENOENT") return defaultContent();
    if (error instanceof SyntaxError) {
      throw new Error("data/content.json could not be read. Delete that file to start again from the original site.");
    }
    throw error;
  }
}

async function persist(content: SiteContent) {
  await mkdir(path.dirname(FILE), { recursive: true });
  const tmp = `${FILE}.tmp`;
  await writeFile(tmp, `${JSON.stringify(content, null, 2)}\n`);
  await rename(tmp, FILE);
}

export async function loadContent() {
  try {
    return await readFresh();
  } catch {
    return defaultContent();
  }
}

export function updateContent(mutate: (current: SiteContent) => SiteContent) {
  const job = queue.then(async () => {
    const current = await readFresh();
    const next = normalize(mutate(current));
    await persist(next);
    return next;
  });
  queue = job.then(
    () => undefined,
    () => undefined,
  );
  return job;
}

type Fail = { ok: false; error: string };
type Ok = { ok: true };

function bookInput(input: unknown, genres: string[], id: string | null, used: Set<string>) {
  if (!input || typeof input !== "object") return { ok: false as const, error: "That book was empty." };
  const raw = input as Partial<SiteBook>;
  const title = text(raw.title, 120, "");
  const author = text(raw.author, 120, "");
  const genre = text(raw.genre, 40, "");
  const blurb = text(raw.blurb, 280, "");
  const pages = clamp(raw.pages, 1, 20000, 0);
  if (!title) return { ok: false as const, error: "Add a title." };
  if (!author) return { ok: false as const, error: "Add an author." };
  if (!genres.includes(genre)) return { ok: false as const, error: "Choose a genre from the list." };
  if (!blurb) return { ok: false as const, error: "Add a short blurb." };
  if (!pages) return { ok: false as const, error: "Enter a page count from 1 to 20,000." };
  const book: SiteBook = {
    id: id ?? uniqueId(title, used),
    title,
    author,
    genre,
    pages,
    blurb,
    featured: raw.featured === true,
  };
  return { ok: true as const, book };
}

const COPY_MAX: Record<keyof SiteCopy, number> = {
  siteName: 40,
  motto: 80,
  metaDescription: 180,
  eyebrow: 60,
  heroTitle: 90,
  heroLede: 500,
  primaryCta: 40,
  secondaryCta: 40,
  roomsHeading: 60,
  roomReading: 180,
  roomArt: 180,
  roomCozy: 180,
  roomStudio: 180,
  roomLibrary: 180,
  kindnessHeading: 60,
  kindnessBody: 900,
  startersHeading: 60,
  startersLede: 240,
  reviewsHeading: 60,
  reviewsLede: 240,
  honestHeading: 80,
  honestBody: 900,
  footerNote: 320,
};

function appearanceError(copy: Partial<SiteCopy> | undefined, theme: Partial<SiteTheme> | undefined) {
  if (!copy || !theme) return "Nothing to save.";
  for (const key of Object.keys(COPY_MAX) as (keyof SiteCopy)[]) {
    const value = copy[key];
    if (typeof value !== "string" || !value.trim()) return "Fill in every text field. Empty words fall off the page.";
    if (value.trim().length > COPY_MAX[key]) return `Keep each text field within its limit. “${key}” allows ${COPY_MAX[key]} characters.`;
  }
  const colors: (keyof SiteTheme)[] = [
    "cream",
    "ink",
    "lavender",
    "lavenderDeep",
    "pink",
    "pinkDeep",
    "sage",
    "sageDeep",
    "blue",
    "blueDeep",
    "gold",
  ];
  for (const key of colors) {
    if (typeof theme[key] !== "string" || !/^#[0-9a-fA-F]{6}$/.test(theme[key] as string)) {
      return "Use a color like #fbf6ee for each swatch.";
    }
  }
  const radius = Number(theme.radius);
  if (!Number.isFinite(radius) || radius < 16 || radius > 40) return "Choose a corner radius from 16 to 40.";
  return "";
}

export async function saveAppearance(input: unknown): Promise<Ok | Fail> {
  if (!input || typeof input !== "object") return { ok: false, error: "Nothing to save." };
  const raw = input as { copy?: SiteCopy; theme?: SiteTheme };
  const problem = appearanceError(raw.copy, raw.theme);
  if (problem) return { ok: false, error: problem };
  try {
    await updateContent((current) => ({
      ...current,
      copy: { ...current.copy, ...raw.copy },
      theme: { ...current.theme, ...raw.theme, radius: Math.round(Number(raw.theme?.radius)) },
    }));
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "The look could not be saved." };
  }
}

export async function resetAppearance(): Promise<Ok | Fail> {
  try {
    await updateContent((current) => ({ ...current, copy: defaultCopy(), theme: defaultTheme() }));
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "The original look could not be restored." };
  }
}

export async function createBook(input: unknown): Promise<Ok | Fail> {
  let error = "";
  try {
    await updateContent((current) => {
      if (current.books.length >= LIMITS.books) {
        error = `The list holds ${LIMITS.books} books. Remove one first.`;
        return current;
      }
      const parsed = bookInput(input, allGenres(current), null, new Set(current.books.map((book) => book.id)));
      if (!parsed.ok) {
        error = parsed.error;
        return current;
      }
      const books = parsed.book.featured ? [parsed.book, ...current.books] : [...current.books, parsed.book];
      return { ...current, books };
    });
  } catch (caught) {
    return { ok: false, error: caught instanceof Error ? caught.message : "The book could not be saved." };
  }
  return error ? { ok: false, error } : { ok: true };
}

export async function updateBook(input: unknown): Promise<Ok | Fail> {
  let error = "";
  try {
    await updateContent((current) => {
      const id = input && typeof input === "object" ? text((input as { id?: string }).id, 80, "") : "";
      if (!current.books.some((book) => book.id === id)) {
        error = "That book is no longer on the list.";
        return current;
      }
      const parsed = bookInput(input, allGenres(current), id, new Set());
      if (!parsed.ok) {
        error = parsed.error;
        return current;
      }
      const rest = current.books.filter((book) => book.id !== id);
      const books = parsed.book.featured ? [parsed.book, ...rest] : [...rest, parsed.book];
      return { ...current, books };
    });
  } catch (caught) {
    return { ok: false, error: caught instanceof Error ? caught.message : "The book could not be saved." };
  }
  return error ? { ok: false, error } : { ok: true };
}

export async function deleteBook(id: string): Promise<Ok | Fail> {
  if (!/^[a-z0-9-]{1,80}$/.test(id)) return { ok: false, error: "That book is no longer on the list." };
  try {
    await updateContent((current) => ({
      ...current,
      books: current.books.filter((book) => book.id !== id),
      reviews: current.reviews.filter((review) => review.bookId !== id),
    }));
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "The book could not be removed." };
  }
}

export async function addGenre(name: string): Promise<Ok | Fail> {
  const genre = name.trim();
  if (genre.length < 2 || genre.length > 32) return { ok: false, error: "Use a genre name from 2 to 32 characters." };
  if (!/^[\p{L}\p{N} '\-]+$/u.test(genre)) return { ok: false, error: "Use letters, numbers, spaces, apostrophes, or hyphens." };
  let error = "";
  try {
    await updateContent((current) => {
      if (allGenres(current).some((item) => item.toLowerCase() === genre.toLowerCase())) {
        error = "That genre is already on the list.";
        return current;
      }
      if (current.extraGenres.length >= LIMITS.genres) {
        error = `You can add ${LIMITS.genres} extra genres.`;
        return current;
      }
      return { ...current, extraGenres: [...current.extraGenres, genre] };
    });
  } catch (caught) {
    return { ok: false, error: caught instanceof Error ? caught.message : "The genre could not be saved." };
  }
  return error ? { ok: false, error } : { ok: true };
}

export async function removeGenre(name: string): Promise<Ok | Fail> {
  const genre = name.trim();
  if ((GENRES as readonly string[]).includes(genre)) {
    return { ok: false, error: "The original genres stay, because the book covers know them." };
  }
  let error = "";
  try {
    await updateContent((current) => {
      if (current.books.some((book) => book.genre === genre)) {
        error = "Move or remove the books in that genre first.";
        return current;
      }
      return { ...current, extraGenres: current.extraGenres.filter((item) => item !== genre) };
    });
  } catch (caught) {
    return { ok: false, error: caught instanceof Error ? caught.message : "The genre could not be removed." };
  }
  return error ? { ok: false, error } : { ok: true };
}

function reviewInput(input: unknown, books: SiteBook[], id: string | null) {
  if (!input || typeof input !== "object") return { ok: false as const, error: "That note was empty." };
  const raw = input as Partial<SiteReview>;
  const bookId = text(raw.bookId, 80, "");
  const reviewer = text(raw.reviewer, 24, "");
  const quote = text(raw.quote, 400, "");
  const nicknameError = validateNickname(reviewer);
  if (!books.some((book) => book.id === bookId)) return { ok: false as const, error: "Choose a book from the list." };
  if (nicknameError) return { ok: false as const, error: nicknameError };
  if (quote.length < 8) return { ok: false as const, error: "Write at least a short sentence." };
  const review: SiteReview = { id: id ?? `note-${crypto.randomUUID().slice(0, 8)}`, bookId, reviewer, quote, visible: raw.visible !== false };
  return { ok: true as const, review };
}

export async function createReview(input: unknown): Promise<Ok | Fail> {
  let error = "";
  try {
    await updateContent((current) => {
      if (current.reviews.length >= LIMITS.reviews) {
        error = `The desk holds ${LIMITS.reviews} notes. Remove one first.`;
        return current;
      }
      const parsed = reviewInput(input, current.books, null);
      if (!parsed.ok) {
        error = parsed.error;
        return current;
      }
      return { ...current, reviews: [parsed.review, ...current.reviews] };
    });
  } catch (caught) {
    return { ok: false, error: caught instanceof Error ? caught.message : "The note could not be saved." };
  }
  return error ? { ok: false, error } : { ok: true };
}

export async function updateReview(input: unknown): Promise<Ok | Fail> {
  let error = "";
  try {
    await updateContent((current) => {
      const id = input && typeof input === "object" ? text((input as { id?: string }).id, 80, "") : "";
      if (!current.reviews.some((review) => review.id === id)) {
        error = "That note is no longer here.";
        return current;
      }
      const parsed = reviewInput(input, current.books, id);
      if (!parsed.ok) {
        error = parsed.error;
        return current;
      }
      return { ...current, reviews: current.reviews.map((review) => (review.id === id ? parsed.review : review)) };
    });
  } catch (caught) {
    return { ok: false, error: caught instanceof Error ? caught.message : "The note could not be saved." };
  }
  return error ? { ok: false, error } : { ok: true };
}

export async function deleteReview(id: string): Promise<Ok | Fail> {
  if (!/^[a-z0-9-]{1,80}$/.test(id)) return { ok: false, error: "That note is no longer here." };
  try {
    await updateContent((current) => ({ ...current, reviews: current.reviews.filter((review) => review.id !== id) }));
    return { ok: true };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "The note could not be removed." };
  }
}
