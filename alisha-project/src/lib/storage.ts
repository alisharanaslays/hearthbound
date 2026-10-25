import { ART_CATEGORIES } from "./art";
import { CHEERS } from "./cheers";
import { todayISO } from "./dates";
import { SKETCH_CATEGORIES, SKETCH_LIMITS } from "./sketch";
import type {
  ArtCategory,
  AvatarId,
  Book,
  Cheer,
  ColoringItem,
  LittleBookItem,
  MotifId,
  PictureId,
  ReadingStatus,
  Report,
  ShelfItem,
  SketchCategory,
  SketchItem,
  SketchKind,
  SketchStroke,
  Store,
  Submission,
} from "./types";

const AVATARS: AvatarId[] = ["fox", "moon", "mushroom", "book", "star", "whale"];
const MOTIFS: MotifId[] = [
  "lantern-isle",
  "tea-dragon",
  "reading-fox",
  "glass-garden",
  "moon-hare",
  "star-sailor",
  "mapmaker",
  "two-weather",
];
const PICTURES: PictureId[] = ["fox", "moon", "boat", "tree", "dragon", "house", "star", "flower"];
const STATUSES: ReadingStatus[] = ["planned", "reading", "completed"];
const CHEER_IDS = new Set(CHEERS.map((cheer) => cheer.id));

export const LIMITS = {
  books: 200,
  submissions: 24,
  shelf: 40,
  cheers: 200,
  reports: 100,
  sketches: SKETCH_LIMITS.items,
};

export function defaultStore(): Store {
  return {
    version: 1,
    profile: { nickname: "Reader", avatar: "fox" },
    books: [],
    favoriteGenres: [],
    goals: { year: new Date().getFullYear() },
    submissions: [],
    cheers: [],
    reports: [],
    hiddenArtIds: [],
    shelf: [],
    sketches: [],
  };
}

function asString(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function asDate(value: unknown) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : undefined;
}

function asInt(value: unknown, min: number, max: number) {
  if (typeof value !== "number" || !Number.isFinite(value)) return undefined;
  const rounded = Math.round(value);
  if (rounded < min || rounded > max) return undefined;
  return rounded;
}

function asBook(value: unknown): Book | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Partial<Book>;
  const title = asString(raw.title, 120);
  const author = asString(raw.author, 120);
  const genre = asString(raw.genre, 40);
  const totalPages = asInt(raw.totalPages, 1, 20000);
  const pagesRead = asInt(raw.pagesRead, 0, 20000);
  if (!title || !author || !genre || totalPages === undefined || pagesRead === undefined) return null;
  if (!STATUSES.includes(raw.status as ReadingStatus)) return null;
  const progressLog = Array.isArray(raw.progressLog)
    ? raw.progressLog
        .map((entry) => {
          if (!entry || typeof entry !== "object") return null;
          const at = asDate((entry as { at?: unknown }).at);
          const delta = asInt((entry as { delta?: unknown }).delta, -20000, 20000);
          if (!at || delta === undefined || delta === 0) return null;
          return { at, delta };
        })
        .filter((entry): entry is { at: string; delta: number } => Boolean(entry))
        .slice(0, 400)
    : [];

  return {
    id: asString(raw.id, 80) || crypto.randomUUID(),
    title,
    author,
    genre,
    totalPages,
    pagesRead: Math.min(pagesRead, totalPages),
    status: raw.status as ReadingStatus,
    startedOn: asDate(raw.startedOn),
    finishedOn: asDate(raw.finishedOn),
    coverDataUrl: typeof raw.coverDataUrl === "string" && raw.coverDataUrl.startsWith("data:image/")
      ? raw.coverDataUrl.slice(0, 1_500_000)
      : undefined,
    progressLog,
    createdAt: asString(raw.createdAt, 40) || new Date().toISOString(),
    favorite: raw.favorite === true,
    sample: raw.sample === true,
  };
}

function asSubmission(value: unknown): Submission | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Partial<Submission>;
  const title = asString(raw.title, 80);
  const description = asString(raw.description, 400);
  if (!title || !description) return null;
  if (!ART_CATEGORIES.includes(raw.category as ArtCategory)) return null;
  const motif = MOTIFS.includes(raw.motif as MotifId) ? (raw.motif as MotifId) : undefined;
  const imageDataUrl =
    typeof raw.imageDataUrl === "string" && raw.imageDataUrl.startsWith("data:image/")
      ? raw.imageDataUrl.slice(0, 1_500_000)
      : undefined;
  if (!motif && !imageDataUrl) return null;
  return {
    id: asString(raw.id, 80) || crypto.randomUUID(),
    title,
    description,
    inspiration: asString(raw.inspiration, 120) || undefined,
    category: raw.category as ArtCategory,
    imageDataUrl,
    motif,
    createdAt: asString(raw.createdAt, 40) || new Date().toISOString(),
  };
}

function asStroke(value: unknown): SketchStroke | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Partial<SketchStroke>;
  if (raw.tool !== "pen" && raw.tool !== "eraser") return null;
  if (typeof raw.color !== "string" || !/^#[0-9a-fA-F]{6}$/.test(raw.color)) return null;
  const size = asInt(raw.size, 1, 48);
  if (!size || !Array.isArray(raw.points)) return null;
  const points: [number, number][] = [];
  for (const point of raw.points) {
    if (!Array.isArray(point) || point.length < 2) continue;
    const x = asInt(point[0], 0, 2000);
    const y = asInt(point[1], 0, 2000);
    if (x === undefined || y === undefined) continue;
    points.push([x, y]);
    if (points.length >= SKETCH_LIMITS.points) break;
  }
  if (points.length === 0) return null;
  return { tool: raw.tool, color: raw.color.toLowerCase(), size, points };
}

function asSketch(value: unknown): SketchItem | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Partial<SketchItem>;
  const title = asString(raw.title, SKETCH_LIMITS.title);
  if (title.length < 2) return null;
  if (raw.kind !== "drawing" && raw.kind !== "upload") return null;
  if (!SKETCH_CATEGORIES.includes(raw.category as SketchCategory)) return null;
  const strokes = Array.isArray(raw.strokes)
    ? raw.strokes.map(asStroke).filter((stroke): stroke is SketchStroke => Boolean(stroke)).slice(0, SKETCH_LIMITS.strokes)
    : [];
  const imageDataUrl =
    typeof raw.imageDataUrl === "string" && /^data:image\/(jpeg|png|webp);/i.test(raw.imageDataUrl)
      ? raw.imageDataUrl.slice(0, 1_200_000)
      : undefined;
  if (raw.kind === "drawing" && strokes.length === 0) return null;
  if (raw.kind === "upload" && !imageDataUrl) return null;
  const reply = asString(raw.reviewReply, 500);
  return {
    id: asString(raw.id, 80) || crypto.randomUUID(),
    kind: raw.kind as SketchKind,
    title,
    description: asString(raw.description, SKETCH_LIMITS.description),
    category: raw.category as SketchCategory,
    strokes: raw.kind === "drawing" ? strokes : undefined,
    imageDataUrl,
    askedReview: raw.askedReview === true,
    reviewReply: reply || undefined,
    createdAt: asString(raw.createdAt, 40) || new Date().toISOString(),
    updatedAt: asString(raw.updatedAt, 40) || new Date().toISOString(),
  };
}

function asShelf(value: unknown): ShelfItem | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Partial<ShelfItem>;
  const title = asString(raw.title, 40);
  if (!title) return null;
  const base = {
    id: asString(raw.id, 80) || crypto.randomUUID(),
    title,
    createdAt: asString(raw.createdAt, 40) || new Date().toISOString(),
    updatedAt: asString(raw.updatedAt, 40) || new Date().toISOString(),
  };
  if (raw.kind === "coloring") {
    const colors: Record<string, string> = {};
    if (raw.colors && typeof raw.colors === "object") {
      for (const [key, color] of Object.entries(raw.colors)) {
        if (/^[a-z-]{1,24}$/.test(key) && typeof color === "string" && /^#[0-9a-fA-F]{6}$/.test(color)) {
          colors[key] = color.toLowerCase();
        }
      }
    }
    const item: ColoringItem = { ...base, kind: "coloring", colors };
    return item;
  }
  if (raw.kind === "book" && Array.isArray(raw.pages)) {
    const pages = raw.pages
      .map((page) => {
        if (!page || typeof page !== "object") return null;
        const picture = (page as { picture?: unknown }).picture;
        const text = asString((page as { text?: unknown }).text, 180);
        if (!PICTURES.includes(picture as PictureId)) return null;
        return { picture: picture as PictureId, text };
      })
      .filter((page): page is { picture: PictureId; text: string } => Boolean(page))
      .slice(0, 6);
    if (pages.length === 0) return null;
    const item: LittleBookItem = { ...base, kind: "book", pages };
    return item;
  }
  return null;
}

export function sanitize(value: unknown): Store {
  const fallback = defaultStore();
  if (!value || typeof value !== "object") return fallback;
  const raw = value as Partial<Store>;
  const avatar = AVATARS.includes(raw.profile?.avatar as AvatarId) ? (raw.profile?.avatar as AvatarId) : "fox";
  const nickname = asString(raw.profile?.nickname, 24);
  const year = asInt(raw.goals?.year, 2000, 2100) ?? new Date().getFullYear();

  const cheers: Cheer[] = Array.isArray(raw.cheers)
    ? raw.cheers
        .map((cheer) => {
          if (!cheer || typeof cheer !== "object") return null;
          const artId = asString((cheer as Cheer).artId, 80);
          const messageId = asString((cheer as Cheer).messageId, 40);
          const at = asString((cheer as Cheer).at, 40);
          if (!artId || !CHEER_IDS.has(messageId as (typeof CHEERS)[number]["id"]) || !at) return null;
          return { artId, messageId, at };
        })
        .filter((cheer): cheer is Cheer => Boolean(cheer))
        .slice(0, LIMITS.cheers)
    : [];

  const reports: Report[] = [];
  if (Array.isArray(raw.reports)) {
    for (const value of raw.reports) {
      if (!value || typeof value !== "object") continue;
      const artId = asString((value as Report).artId, 80);
      const artTitle = asString((value as Report).artTitle, 80);
      const reason = asString((value as Report).reason, 80);
      if (!artId || !artTitle || !reason) continue;
      const note = asString((value as Report).note, 280);
      reports.push({
        id: asString((value as Report).id, 80) || crypto.randomUUID(),
        artId,
        artTitle,
        reason,
        note: note || undefined,
        createdAt: asString((value as Report).createdAt, 40) || new Date().toISOString(),
      });
      if (reports.length >= LIMITS.reports) break;
    }
  }

  return {
    version: 1,
    profile: { nickname: nickname.length >= 2 ? nickname : "Reader", avatar },
    books: Array.isArray(raw.books) ? raw.books.map(asBook).filter((book): book is Book => Boolean(book)).slice(0, LIMITS.books) : [],
    favoriteGenres: Array.isArray(raw.favoriteGenres)
      ? [...new Set(raw.favoriteGenres.map((genre) => asString(genre, 40)).filter((genre) => genre.length >= 2 && !/@/.test(genre) && !/\d{6,}/.test(genre)))]
      : [],
    goals: {
      year,
      books: asInt(raw.goals?.books, 1, 500),
      pages: asInt(raw.goals?.pages, 1, 200000),
    },
    submissions: Array.isArray(raw.submissions)
      ? raw.submissions.map(asSubmission).filter((item): item is Submission => Boolean(item)).slice(0, LIMITS.submissions)
      : [],
    cheers,
    reports,
    hiddenArtIds: Array.isArray(raw.hiddenArtIds)
      ? [...new Set(raw.hiddenArtIds.map((id) => asString(id, 80)).filter(Boolean))].slice(0, 200)
      : [],
    shelf: Array.isArray(raw.shelf) ? raw.shelf.map(asShelf).filter((item): item is ShelfItem => Boolean(item)).slice(0, LIMITS.shelf) : [],
    sketches: Array.isArray(raw.sketches)
      ? raw.sketches.map(asSketch).filter((item): item is SketchItem => Boolean(item)).slice(0, LIMITS.sketches)
      : [],
  };
}

export const STORAGE_KEY = "hearthbound.v1";
export const STORE_EVENT = "hearthbound-change";

let memory: Store | null = null;
let lastError: string | null = null;

export function getLastError() {
  return lastError;
}

export function load(): Store {
  if (memory) return memory;
  if (typeof window === "undefined") return defaultStore();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    memory = raw ? sanitize(JSON.parse(raw)) : defaultStore();
  } catch {
    memory = defaultStore();
    lastError = "Saved data on this device could not be read, so a fresh shelf was opened.";
  }
  return memory;
}

export function reloadFromDisk() {
  memory = null;
  return load();
}

export function save(next: Store): { ok: boolean; message?: string } {
  const clean = sanitize(next);
  memory = clean;
  lastError = null;
  if (typeof window === "undefined") return { ok: true };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
    window.dispatchEvent(new CustomEvent(STORE_EVENT));
    return { ok: true };
  } catch {
    const message =
      "This browser could not store that. It will stay for this visit only. Try a smaller image, or remove something you no longer need.";
    lastError = message;
    window.dispatchEvent(new CustomEvent(STORE_EVENT, { detail: { error: message } }));
    return { ok: false, message };
  }
}

export function eraseStore() {
  memory = defaultStore();
  lastError = null;
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    lastError = "The browser blocked clearing local data.";
  }
  window.dispatchEvent(new CustomEvent(STORE_EVENT));
}

export function currentYearLabel() {
  return todayISO().slice(0, 4);
}
