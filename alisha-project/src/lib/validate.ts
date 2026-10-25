import { isRealDate, todayISO } from "./dates";
import { GENRES } from "./genres";
import type { ArtCategory, BookDraft, ReadingStatus } from "./types";
import { ART_CATEGORIES } from "./art";

export type FieldErrors = Record<string, string>;

function requiredText(value: string, max: number, label: string) {
  const trimmed = value.trim();
  if (!trimmed) return `Add a ${label}.`;
  if (trimmed.length > max) return `Keep the ${label} under ${max} characters.`;
  return "";
}

export function validateBook(draft: BookDraft, genres: readonly string[] = GENRES): FieldErrors {
  const errors: FieldErrors = {};
  const titleError = requiredText(draft.title, 120, "title");
  if (titleError) errors.title = titleError;
  const author = draft.author.trim();
  if (!author) errors.author = "Add an author.";
  else if (author.length > 120) errors.author = "Keep the author under 120 characters.";
  if (!genres.includes(draft.genre)) errors.genre = "Choose a genre.";
  if (!Number.isInteger(draft.totalPages) || draft.totalPages < 1 || draft.totalPages > 20000) {
    errors.totalPages = "Enter a page count from 1 to 20,000.";
  }
  if (!Number.isInteger(draft.pagesRead) || draft.pagesRead < 0) {
    errors.pagesRead = "Pages read cannot be negative.";
  } else if (draft.totalPages >= 1 && draft.pagesRead > draft.totalPages) {
    errors.pagesRead = "Pages read cannot pass the last page.";
  }

  const today = todayISO();
  const checkDate = (value: string | undefined, key: string, label: string, required: boolean) => {
    if (!value) {
      if (required) errors[key] = `Add the date you ${label}.`;
      return;
    }
    if (!isRealDate(value)) errors[key] = "Use a real date.";
    else if (value > today) errors[key] = "That date is still in the future.";
  };

  if (draft.status === "reading") {
    checkDate(draft.startedOn, "startedOn", "started", true);
    if (draft.finishedOn) errors.finishedOn = "Clear the finish date, or mark the book completed.";
    if (draft.totalPages >= 1 && draft.pagesRead >= draft.totalPages) {
      errors.pagesRead = "Mark it completed, or leave at least one page still to go.";
    }
  }

  if (draft.status === "completed") {
    checkDate(draft.startedOn, "startedOn", "started", true);
    checkDate(draft.finishedOn, "finishedOn", "finished", true);
    if (draft.startedOn && draft.finishedOn && draft.finishedOn < draft.startedOn) {
      errors.finishedOn = "The finish date needs to be on or after the start date.";
    }
  }

  if (draft.status === "planned") {
    checkDate(draft.startedOn, "startedOn", "started", false);
    if (draft.finishedOn) errors.finishedOn = "A finish date belongs on a completed book.";
  }

  return errors;
}

export function validateNickname(value: string) {
  const nickname = value.trim();
  if (nickname.length < 2) return "Use at least 2 characters.";
  if (nickname.length > 24) return "Keep your nickname under 24 characters.";
  if (/@/.test(nickname) || /\d{6,}/.test(nickname)) {
    return "Use a nickname, not an email, phone number, or other contact detail.";
  }
  if (!/^[\p{L}\p{N} '\-]+$/u.test(nickname)) {
    return "Use letters, numbers, spaces, apostrophes, or hyphens.";
  }
  return "";
}

export function validateArt(input: {
  title: string;
  description: string;
  inspiration: string;
  category: string;
  hasImage: boolean;
  motif: string;
  acknowledged: boolean;
}) {
  const errors: FieldErrors = {};
  const title = requiredText(input.title, 80, "title");
  const description = requiredText(input.description, 400, "description");
  if (title) errors.title = title;
  if (description) errors.description = description;
  if (input.inspiration.trim().length > 120) errors.inspiration = "Keep the book inspiration under 120 characters.";
  if (!ART_CATEGORIES.includes(input.category as ArtCategory)) errors.category = "Choose a category.";
  if (!input.hasImage && !input.motif) errors.image = "Add an image, or choose a placeholder motif.";
  if (!input.acknowledged) {
    errors.acknowledged = "Confirm that you understand this stays on this device and is not published.";
  }
  return errors;
}

export function validateGoals(books: string, pages: string) {
  const errors: FieldErrors = {};
  const check = (value: string, key: string, max: number, label: string) => {
    if (!value.trim()) return;
    if (!/^\d+$/.test(value.trim())) {
      errors[key] = `Enter a whole number of ${label}.`;
      return;
    }
    const number = Number(value);
    if (number < 1 || number > max) errors[key] = `Choose a ${label} goal from 1 to ${max.toLocaleString()}.`;
  };
  check(books, "books", 500, "book");
  check(pages, "pages", 200000, "page");
  return errors;
}

export function statusLabel(status: ReadingStatus) {
  if (status === "reading") return "Reading";
  if (status === "completed") return "Finished";
  return "Planned";
}
