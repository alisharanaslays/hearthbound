"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { SiteCopy, SiteTheme } from "@/lib/site";
import { ConfirmButton, Notice } from "../ui";
import { deskSend } from "./desk";

const WORDS: { key: keyof SiteCopy; label: string; hint?: string; long?: boolean; max: number }[] = [
  { key: "siteName", label: "Site name", max: 40 },
  { key: "motto", label: "Motto", hint: "Separate the words with periods or dots, such as Read. Create. Imagine. Belong.", max: 80 },
  { key: "metaDescription", label: "Short description", hint: "Used in the browser tab description.", max: 180, long: true },
  { key: "eyebrow", label: "Small line above the title", max: 60 },
  { key: "heroTitle", label: "Homepage title", max: 90 },
  { key: "heroLede", label: "Homepage introduction", max: 500, long: true },
  { key: "primaryCta", label: "First button", max: 40 },
  { key: "secondaryCta", label: "Second button", max: 40 },
  { key: "roomsHeading", label: "Rooms heading", max: 60 },
  { key: "roomReading", label: "My Reading card", max: 180, long: true },
  { key: "roomArt", label: "Art Hub card", max: 180, long: true },
  { key: "roomCozy", label: "Cozy Corner card", max: 180, long: true },
  { key: "roomStudio", label: "Story Studio card", max: 180, long: true },
  { key: "roomLibrary", label: "My Library card", max: 180, long: true },
  { key: "kindnessHeading", label: "Kindness heading", max: 60 },
  { key: "kindnessBody", label: "Kindness text", hint: "Leave a blank line to start a second paragraph.", max: 900, long: true },
  { key: "startersHeading", label: "Book list heading", max: 60 },
  { key: "startersLede", label: "Book list introduction", max: 240, long: true },
  { key: "reviewsHeading", label: "Shelf notes heading", max: 60 },
  { key: "reviewsLede", label: "Shelf notes introduction", max: 240, long: true },
  { key: "honestHeading", label: "Safety note heading", max: 80 },
  {
    key: "honestBody",
    label: "Safety note",
    hint: "Keep this honest. The longer safety page is not edited here, and the site should not claim to be fully safe for children.",
    max: 900,
    long: true,
  },
  { key: "footerNote", label: "Footer note", max: 320, long: true },
];

const COLORS: { key: keyof SiteTheme; label: string }[] = [
  { key: "cream", label: "Paper" },
  { key: "ink", label: "Ink" },
  { key: "lavender", label: "Lavender" },
  { key: "lavenderDeep", label: "Deep lavender" },
  { key: "pink", label: "Pink" },
  { key: "pinkDeep", label: "Deep pink" },
  { key: "sage", label: "Sage" },
  { key: "sageDeep", label: "Deep sage" },
  { key: "blue", label: "Blue" },
  { key: "blueDeep", label: "Deep blue" },
  { key: "gold", label: "Gold" },
];

export function AppearanceForm({ copy, theme }: { copy: SiteCopy; theme: SiteTheme }) {
  const router = useRouter();
  const [words, setWords] = useState(copy);
  const [colors, setColors] = useState(theme);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");
  const [pending, setPending] = useState(false);

  async function save(event?: FormEvent) {
    event?.preventDefault();
    setPending(true);
    setError("");
    setSaved("");
    const result = await deskSend("/api/admin/appearance", "PUT", { copy: words, theme: colors });
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSaved("Saved. The public pages use this look now.");
    router.refresh();
  }

  async function restore() {
    setPending(true);
    setError("");
    setSaved("");
    const result = await deskSend("/api/admin/appearance", "DELETE");
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    window.location.assign("/admin/appearance");
  }

  return (
    <form onSubmit={save} noValidate>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {saved ? <Notice tone="good">{saved}</Notice> : null}
      <section className="card" aria-labelledby="words-heading">
        <h2 id="words-heading">Words</h2>
        {WORDS.map((field) => (
          <div className="field" key={field.key}>
            <label htmlFor={`copy-${field.key}`}>{field.label}</label>
            {field.long ? (
              <textarea
                id={`copy-${field.key}`}
                value={words[field.key]}
                maxLength={field.max}
                rows={field.max > 400 ? 6 : 3}
                onChange={(event) => setWords({ ...words, [field.key]: event.target.value })}
              />
            ) : (
              <input
                id={`copy-${field.key}`}
                value={words[field.key]}
                maxLength={field.max}
                onChange={(event) => setWords({ ...words, [field.key]: event.target.value })}
              />
            )}
            {field.hint ? <p className="hint">{field.hint}</p> : null}
          </div>
        ))}
      </section>
      <section className="card" style={{ marginTop: "1rem" }} aria-labelledby="colors-heading">
        <h2 id="colors-heading">Colors and corners</h2>
        <p className="hint">Pastel backgrounds and deeper colors for buttons. The change shows on the whole site after you save.</p>
        <div className="color-grid">
          {COLORS.map((field) => (
            <div className="field" key={field.key}>
              <label htmlFor={`color-${field.key}`}>{field.label}</label>
              <div className="color-row">
                <input
                  id={`color-${field.key}`}
                  type="color"
                  value={colors[field.key] as string}
                  aria-label={`${field.label} picker`}
                  onChange={(event) => setColors({ ...colors, [field.key]: event.target.value })}
                />
                <input
                  aria-label={`${field.label} hex`}
                  value={colors[field.key] as string}
                  maxLength={7}
                  onChange={(event) => setColors({ ...colors, [field.key]: event.target.value })}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="field">
          <label htmlFor="radius">Corner radius ({colors.radius})</label>
          <input
            id="radius"
            type="range"
            min={16}
            max={40}
            value={colors.radius}
            onChange={(event) => setColors({ ...colors, radius: Number(event.target.value) })}
          />
        </div>
      </section>
      <div className="cluster" style={{ marginTop: "1rem" }}>
        <button className="btn primary" type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save look and words"}
        </button>
        <ConfirmButton label="Restore original look" prompt="Restore the original words and colors? Books and notes stay." confirmLabel="Restore" onConfirm={() => void restore()} />
      </div>
    </form>
  );
}
