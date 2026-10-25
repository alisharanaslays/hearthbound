# Hearthbound

A cozy creative community for people who love books. The motto is **Read. Create. Imagine. Belong.**

This folder is the app. The same guide is in the repository README.

This is a first-version prototype. It is a polished front end with browser storage and one real server rule: publishing is refused. It is not a finished place for children, and it does not claim to be fully safe.

## Why this stack

- **Next.js (App Router), React, and TypeScript.** The product needs server checks for age and publishing later. Next.js gives that boundary without a separate backend service yet.
- **Plain CSS.** The storybook look is custom, so it is not a default component theme.
- **Browser storage for personal shelves.** No database is configured. Reading logs, drafts, coloring, and reports stay on the device.
- **No paid services, accounts, or book API.** Those can be added when the product is ready for them.

An age typed in the browser is never treated as proof of age. The publication route ignores any age field and returns a refusal.

## Run it

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run typecheck
npm run build
npm start
```

## Environment variables

`ADMIN_SECRET` opens the site desk at [/admin](http://localhost:3000/admin). Put it in `.env.local` (see `.env.example`), use at least 8 characters, and restart the server. It is one shared secret for the person running this server, not a visitor account. Do not commit it, and do not put other API keys in frontend code.

The desk saves public words, colors, books, and shelf notes to `data/content.json` on the machine running the server. That file is local. A host with a read-only disk will not keep those edits.

## What works

- Homepage, responsive navigation, and a Story Studio “Soon” label.
- Reading tracker stored in this browser:
  - add, edit, and remove a book
  - title, author, genre, optional cover image, dates, and page counts
  - planned, reading, and finished
  - progress updates, including a date for the pages you log
  - private favorites and optional yearly goals
  - monthly and yearly charts for books finished and pages logged
  - sample books you can add and remove
  - suggestions from a curated list, using your genres, shelf, and favorites
- Art Hub:
  - eight original sample pieces and category filters
  - an artwork page
  - prewritten sunshine notes (“Send a little sunshine”)
  - a private tally only on your own submissions
  - report and block controls that affect this browser only
  - a submission form that saves privately and asks the server to publish
- The Sketchbook, stored in this browser only:
  - a drawing page with brush, eraser, sizes, undo, redo, clear, and PNG download
  - uploads of PNG, JPEG, and WebP, previewed before they are kept
  - a private My Creations list
  - “Submit to Art Hub” asks the same closed publication route and leaves the piece as a private draft
- Cozy Corner prototype:
  - coloring page with a palette, keyboard access, save, and print
  - little-book maker with pictures, typed lines, print, and browser read-aloud
  - a private shelf
  - read-aloud uses `speechSynthesis` and does not record or store audio
- My Library: nickname, illustrated avatar, export, and erase.
- Safety and privacy page describing the intended rules.
- Server route `POST /api/publications` always refuses to publish. `GET` returns an empty public shelf.
- Site desk at `/admin`, after `ADMIN_SECRET` is set:
  - edit the site name, motto, homepage copy, colors, and corner radius
  - add, edit, and remove books on the public suggestion list, including which ones appear on the homepage
  - add extra genres
  - write shelf notes, and hide or remove them
  - visitors cannot post reviews, and the desk does not edit a visitor’s private shelf

## What is sample data or only a prototype

- Gallery art and artist nicknames are written for this prototype. The starting book list and shelf notes are too, until you change them in the site desk. Covers are generated here. Page counts are approximate.
- Recommendations are not from a book API.
- Artwork you submit, including Sketchbook pieces, never appears in the gallery. Pending Review, Approved, and Needs Changes are not live statuses, because there is no review queue. Sketchbook saves are local to this browser, not an account.
- Sunshine notes, reports, and blocks are not shared with anyone else. There are no accounts, so there are no other people.
- Parent or guardian sharing is not available. The Cozy Corner button only asks the server, which refuses.
- Story Studio is a coming-soon page. There is no editor.
- Charts count pages on the day you log them, and finished books in the month you mark them finished. Lowering a page count does not rewrite earlier months.
- Speech-to-text is not built. Voice is not recorded.

## What still needs a backend

Before real children, or any real public publishing:

- Accounts and sessions.
- Age assurance that does not trust a client-supplied age, plus parental consent where it is required.
- A database with retention and deletion, separate from this browser.
- Human moderation by a trusted adult, and qualified support for serious reports.
- Server-side permission checks on gallery, artwork, profile, search, recommendations, cheers, reports, blocks, and future stories.
- Separate public spaces for ages 14–15, 16–17, and adults. Under 14 stays private, with sharing only to a securely linked guardian.
- A review decision stored on the server before anything becomes public.
- A book-data provider, if suggestions should leave the curated list.
- Image storage that is not the browser’s local storage.
- A copyright-report path for Story Studio, especially for fan fiction.
- A privacy notice reviewed by a person, not just this README.

AI screening, if it is added later, sits beside human review. It is not a reason to call the site completely safe.

## Limits in this prototype

- Data lives in `localStorage` under `hearthbound.v1`. Clearing the browser clears the shelf. Another device will not see it.
- Large images can hit the browser storage limit. The app resizes uploads and shows an error if storage refuses them.
- The site is `noindex`. It is a prototype, not a public launch.
- There is no direct messaging and no leaderboard, on purpose.
