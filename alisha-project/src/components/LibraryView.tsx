"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { SAMPLE_ART } from "@/lib/art";
import { prettyDate } from "@/lib/dates";
import { eraseStore, load } from "@/lib/storage";
import type { AvatarId } from "@/lib/types";
import { useStore } from "@/lib/use-store";
import { validateNickname } from "@/lib/validate";
import { AVATARS, Avatar, avatarLabel } from "./Avatar";
import { PageHeader } from "./PageHeader";
import { ConfirmButton, Notice } from "./ui";

export function LibraryView() {
  const { store, ready, update, notice, setNotice } = useStore();
  const [nickname, setNickname] = useState("");
  const [avatar, setAvatar] = useState<AvatarId>("fox");
  const [profileError, setProfileError] = useState("");
  const [saved, setSaved] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [confirmErase, setConfirmErase] = useState(false);

  useEffect(() => {
    if (!store || hydrated) return;
    setNickname(store.profile.nickname);
    setAvatar(store.profile.avatar);
    setHydrated(true);
  }, [store, hydrated]);

  if (!ready || !store || !hydrated) {
    return (
      <div className="wrap page">
        <p role="status">Opening your library…</p>
      </div>
    );
  }

  const year = new Date().getFullYear();
  const finished = store.books.filter((book) => book.status === "completed" && book.finishedOn?.startsWith(String(year))).length;

  function saveProfile(event: FormEvent) {
    event.preventDefault();
    const error = validateNickname(nickname);
    setProfileError(error);
    if (error) return;
    update((current) => ({ ...current, profile: { nickname: nickname.trim(), avatar } }));
    setSaved("Saved your nickname and avatar on this device.");
  }

  function exportData() {
    const blob = new Blob([JSON.stringify(load(), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "hearthbound-data.json";
    link.click();
    URL.revokeObjectURL(url);
    setSaved("Downloaded a copy. Hearthbound does not upload that file.");
  }

  return (
    <div className="wrap page">
      <PageHeader
        eyebrow="Only on this device"
        title="My Library"
        lede="A nickname, an illustrated avatar, and the things you have made here. Real names, schools, and contact details do not belong on this page."
      />
      {notice ? <Notice tone="error">{notice}</Notice> : null}
      {saved ? <Notice tone="good">{saved}</Notice> : null}

      <section className="card" aria-labelledby="profile-heading">
        <h2 id="profile-heading">Profile</h2>
        <form onSubmit={saveProfile} noValidate>
          {profileError ? <Notice tone="error">{profileError}</Notice> : null}
          <div className="field">
            <label htmlFor="nickname">Nickname</label>
            <input
              id="nickname"
              name="nickname"
              autoComplete="nickname"
              maxLength={24}
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
              aria-invalid={Boolean(profileError)}
            />
          </div>
          <fieldset>
            <legend>Illustrated avatar</legend>
            <div className="avatar-grid">
              {AVATARS.map((id) => (
                <label key={id} className="avatar-option">
                  <input type="radio" name="avatar" value={id} checked={avatar === id} onChange={() => setAvatar(id)} />
                  <Avatar id={id} />
                  <span>{avatarLabel(id)}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <button className="btn primary" type="submit">Save profile</button>
        </form>
      </section>

      <section className="section" aria-labelledby="reading-snapshot">
        <h2 id="reading-snapshot">Reading</h2>
        <div className="stat-grid">
          <article className="card stat"><strong>{store.books.length}</strong> Books on the shelf</article>
          <article className="card stat"><strong>{finished}</strong> Finished in {year}</article>
          <article className="card stat"><strong>{store.favoriteGenres.length}</strong> Chosen genres</article>
        </div>
        <p style={{ marginTop: "0.8rem" }}><Link href="/reading">Open My Reading</Link></p>
      </section>

      <section className="section" aria-labelledby="my-art">
        <h2 id="my-art">Private artwork</h2>
        <p className="lede">These submissions are not in the gallery. A private tally counts sunshine notes saved in this browser, and it is never shown publicly.</p>
        {store.submissions.length === 0 ? (
          <div className="card empty">
            <h3>No private artwork yet.</h3>
            <p>When you submit a piece, it waits here until a real review process exists. That process is not running.</p>
            <Link className="btn" href="/art/new">Submit artwork</Link>
          </div>
        ) : (
          <div className="stack">
            {store.submissions.map((art) => {
              const tally = store.cheers.filter((cheer) => cheer.artId === art.id).length;
              return (
                <article key={art.id} className="card">
                  <div className="cluster">
                    <h3>{art.title}</h3>
                    <span className="pill pending">Not public</span>
                  </div>
                  <p className="meta">{art.category} · Private tally: {tally} sunshine {tally === 1 ? "note" : "notes"}</p>
                  <div className="cluster">
                    <Link className="btn" href={`/art/${art.id}`}>Open</Link>
                    <ConfirmButton
                      label="Delete"
                      prompt={`Delete ${art.title}?`}
                      confirmLabel="Yes, delete"
                      onConfirm={() =>
                        update((current) => ({
                          ...current,
                          submissions: current.submissions.filter((item) => item.id !== art.id),
                          cheers: current.cheers.filter((cheer) => cheer.artId !== art.id),
                        }))
                      }
                    />
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="section" aria-labelledby="hidden-heading">
        <h2 id="hidden-heading">Blocked on this device</h2>
        {store.hiddenArtIds.length === 0 ? (
          <p>You have not blocked any artwork in this browser.</p>
        ) : (
          <ul className="stack">
            {store.hiddenArtIds.map((id) => {
              const sample = SAMPLE_ART.find((art) => art.id === id);
              const own = store.submissions.find((art) => art.id === id);
              const title = sample?.title ?? own?.title ?? "Untitled piece";
              return (
                <li key={id} className="card cluster" style={{ justifyContent: "space-between" }}>
                  <span>{title}</span>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => update((current) => ({ ...current, hiddenArtIds: current.hiddenArtIds.filter((item) => item !== id) }))}
                  >
                    Unblock
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="section" aria-labelledby="reports-heading">
        <h2 id="reports-heading">Reports saved on this device</h2>
        <p className="lede">These notes are not delivered to a moderator. They show how reporting will be shaped later.</p>
        {store.reports.length === 0 ? (
          <p>No reports saved.</p>
        ) : (
          <ul className="stack">
            {store.reports.map((report) => (
              <li key={report.id} className="card">
                <h3>{report.artTitle}</h3>
                <p>{report.reason}</p>
                {report.note ? <p className="meta">{report.note}</p> : null}
                <p className="meta">{prettyDate(report.createdAt)}</p>
                <button
                  type="button"
                  className="btn quiet"
                  onClick={() => update((current) => ({ ...current, reports: current.reports.filter((item) => item.id !== report.id) }))}
                >
                  Remove report
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="section card" aria-labelledby="data-heading">
        <h2 id="data-heading">Your data</h2>
        <p>Export a JSON copy, or erase the shelf, artwork, coloring, reports, and profile stored in this browser.</p>
        <div className="cluster">
          <button type="button" className="btn" onClick={exportData}>Export my data</button>
          {confirmErase ? (
            <span className="confirm">
              <span>This removes everything Hearthbound saved in this browser.</span>
              <button
                type="button"
                className="btn"
                onClick={() => {
                  eraseStore();
                  setNickname("Reader");
                  setAvatar("fox");
                  setConfirmErase(false);
                  setNotice(null);
                  setSaved("Erased the data in this browser.");
                }}
              >
                Erase everything
              </button>
              <button type="button" className="btn quiet" onClick={() => setConfirmErase(false)}>
                Cancel
              </button>
            </span>
          ) : (
            <button type="button" className="btn quiet" onClick={() => setConfirmErase(true)}>
              Erase everything on this device
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
