import { shiftDays } from "./dates";
import type { Book } from "./types";

export function buildSampleShelf(now = new Date()): Book[] {
  const created = now.toISOString();
  const lastYear = now.getFullYear() - 1;

  return [
    {
      id: "sample-garden",
      title: "The Secret Garden",
      author: "Frances Hodgson Burnett",
      genre: "Classics",
      totalPages: 278,
      pagesRead: 278,
      status: "completed",
      startedOn: `${lastYear}-10-02`,
      finishedOn: `${lastYear}-11-18`,
      progressLog: [{ at: `${lastYear}-11-18`, delta: 278 }],
      createdAt: created,
      sample: true,
    },
    {
      id: "sample-anne",
      title: "Anne of Green Gables",
      author: "L. M. Montgomery",
      genre: "Classics",
      totalPages: 320,
      pagesRead: 320,
      status: "completed",
      startedOn: shiftDays(-50, now),
      finishedOn: shiftDays(-36, now),
      progressLog: [{ at: shiftDays(-36, now), delta: 320 }],
      createdAt: created,
      sample: true,
    },
    {
      id: "sample-charlotte",
      title: "Charlotte's Web",
      author: "E. B. White",
      genre: "Animals",
      totalPages: 192,
      pagesRead: 192,
      status: "completed",
      startedOn: shiftDays(-14, now),
      finishedOn: shiftDays(0, now),
      progressLog: [{ at: shiftDays(0, now), delta: 192 }],
      createdAt: created,
      favorite: true,
      sample: true,
    },
    {
      id: "sample-earthsea",
      title: "A Wizard of Earthsea",
      author: "Ursula K. Le Guin",
      genre: "Fantasy",
      totalPages: 205,
      pagesRead: 80,
      status: "reading",
      startedOn: shiftDays(-10, now),
      progressLog: [
        { at: shiftDays(-10, now), delta: 30 },
        { at: shiftDays(0, now), delta: 50 },
      ],
      createdAt: created,
      sample: true,
    },
    {
      id: "sample-prince",
      title: "The Little Prince",
      author: "Antoine de Saint-Exupéry",
      genre: "Fairy tales",
      totalPages: 96,
      pagesRead: 0,
      status: "planned",
      progressLog: [],
      createdAt: created,
      sample: true,
    },
  ];
}
