"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { SAMPLE_ART } from "@/lib/art";
import { CHEERS, REPORT_REASONS, cheerText } from "@/lib/cheers";
import { useStore } from "@/lib/use-store";
import { ArtworkMotif } from "./ArtworkMotif";
import { Avatar } from "./Avatar";
import { Notice } from "./ui";

export function ArtworkDetail({ id }: { id: string }) {
  const { store, ready, update } = useStore();
  const [revealed, setRevealed] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [reason, setReason] = useState<string>(REPORT_REASONS[0]);
  const [note, setNote] = useState("");
  const [reportError, setReportError] = useState("");
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);
  const [choice, setChoice] = useState("");

  useEffect(() => {
    setRevealed(false);
    setSending(false);
    setChoice("");
    setStatus("");
  }, [id]);

  const sample = SAMPLE_ART.find((art) => art.id === id);
  const submission = store?.submissions.find((art) => art.id === id);
  const art = submission
    ? {
        id: submission.id,
        title: submission.title,
        description: submission.description,
        inspiration: submission.inspiration,
        category: submission.category,
        artist: store?.profile.nickname ?? "You",
        avatar: store?.profile.avatar ?? "fox",
        motif: submission.motif,
        imageDataUrl: submission.imageDataUrl,
        owned: true,
      }
    : sample
      ? { ...sample, imageDataUrl: undefined, owned: false }
      : null;

  useEffect(() => {
    if (art) document.title = `${art.title} · Hearthbound`;
  }, [art]);

  if (!ready || !store) {
    return (
      <div className="wrap page">
        <p role="status">Opening this piece…</p>
      </div>
    );
  }

  if (!art) {
    return (
      <div className="wrap page">
        <h1>This artwork is not on this device.</h1>
        <p className="lede">It may have been removed, or the link is from somewhere else.</p>
        <Link className="btn primary" href="/art">
          Back to Art Hub
        </Link>
      </div>
    );
  }

  const hidden = store.hiddenArtIds.includes(art.id);
  const sent = store.cheers.filter((cheer) => cheer.artId === art.id);
  const sentIds = new Set(sent.map((cheer) => cheer.messageId));
  const existingReport = store.reports.find((report) => report.artId === art.id);

  if (hidden && !revealed) {
    return (
      <div className="wrap page">
        <PageNotice title="You blocked this artwork on this device.">
          <p>It stays out of your gallery. Nothing was sent to a server, and nobody was notified.</p>
          <div className="cluster">
            <button type="button" className="btn primary" onClick={() => update((current) => ({ ...current, hiddenArtIds: current.hiddenArtIds.filter((item) => item !== art.id) }))}>
              Unblock
            </button>
            <button type="button" className="btn" onClick={() => setRevealed(true)}>
              Look anyway
            </button>
            <Link className="btn quiet" href="/art">
              Back to Art Hub
            </Link>
          </div>
        </PageNotice>
      </div>
    );
  }

  function sendSunshine(messageId: string) {
    if (sentIds.has(messageId) || store!.cheers.length >= 200) return;
    update((current) => ({
      ...current,
      cheers: [...current.cheers, { artId: art!.id, messageId, at: new Date().toISOString() }],
    }));
    setSending(false);
    setStatus("Sunshine sent.");
  }

  function saveReport(event: FormEvent) {
    event.preventDefault();
    const trimmed = note.trim();
    if (trimmed.length > 280) {
      setReportError("Keep the note under 280 characters.");
      return;
    }
    if (!reason) {
      setReportError("Choose a reason.");
      return;
    }
    update((current) => ({
      ...current,
      reports: [
        {
          id: crypto.randomUUID(),
          artId: art!.id,
          artTitle: art!.title,
          reason,
          note: trimmed || undefined,
          createdAt: new Date().toISOString(),
        },
        ...current.reports.filter((report) => report.artId !== art!.id),
      ],
    }));
    setReporting(false);
    setStatus("Report saved on this device. No moderator receives it in this prototype.");
  }

  return (
    <div className="wrap page">
      <p className="meta">
        <Link href="/art">Art Hub</Link>
      </p>
      {status ? <Notice tone="good">{status}</Notice> : null}
      {art.owned ? (
        <p className="prototype-note">
          This is your submission. It is not in the public gallery. The server is not reviewing it, and other people cannot see it.
        </p>
      ) : (
        <p className="prototype-note">Sample artwork made for this prototype.</p>
      )}
      <div className="detail">
        <div className="frame card">
          {art.imageDataUrl ? (
            <img src={art.imageDataUrl} alt={art.title} />
          ) : art.motif ? (
            <ArtworkMotif motif={art.motif} title={art.title} />
          ) : null}
        </div>
        <div>
          <p className="eyebrow">{art.category}</p>
          <h1>{art.title}</h1>
          <div className="artist">
            <Avatar id={art.avatar} />
            <p className="meta">by {art.artist}</p>
          </div>
          <p>{art.description}</p>
          {art.inspiration ? <p className="meta">Inspired by {art.inspiration}</p> : null}
          {art.owned ? (
            <p>
              Private tally on this device: {sent.length} sunshine {sent.length === 1 ? "note" : "notes"}. Only you see this number. In this prototype the notes are the ones saved in this browser. Names of senders are not shown.
            </p>
          ) : null}
          <section aria-labelledby="sunshine-heading">
            <h2 id="sunshine-heading">Send a little sunshine</h2>
            <p className="hint">Pick one of the approved notes. The same note can be sent once from this browser. There is no free-text chat.</p>
            {sent.length > 0 ? (
              <ul className="sunshine-list">
                {sent.map((cheer) => (
                  <li key={cheer.messageId}>You sent: {cheerText(cheer.messageId)}</li>
                ))}
              </ul>
            ) : null}
            {sent.length < CHEERS.length ? (
              sending ? (
                <fieldset>
                  <legend>Choose a note</legend>
                  {CHEERS.map((cheer) => (
                    <label key={cheer.id} className="check">
                      <input
                        type="radio"
                        name="cheer"
                        checked={choice === cheer.id}
                        disabled={sentIds.has(cheer.id)}
                        onChange={() => setChoice(cheer.id)}
                      />
                      <span>{sentIds.has(cheer.id) ? `${cheer.text} (already sent)` : cheer.text}</span>
                    </label>
                  ))}
                  <div className="cluster">
                    <button type="button" className="btn primary" disabled={!choice} onClick={() => choice && sendSunshine(choice)}>
                      Send this note
                    </button>
                    <button type="button" className="btn quiet" onClick={() => setSending(false)}>
                      Close
                    </button>
                  </div>
                </fieldset>
              ) : (
                <button type="button" className="btn primary" onClick={() => setSending(true)}>
                  Send a little sunshine
                </button>
              )
            ) : (
              <p>You have sent every note from this browser.</p>
            )}
          </section>
          <div className="quiet-actions">
            <button
              type="button"
              className="btn quiet"
              onClick={() =>
                update((current) => ({
                  ...current,
                  hiddenArtIds: hidden ? current.hiddenArtIds.filter((item) => item !== art.id) : [...current.hiddenArtIds, art.id],
                }))
              }
            >
              {hidden ? "Unblock on this device" : "Block on this device"}
            </button>
            <button type="button" className="btn quiet" onClick={() => setReporting((value) => !value)}>
              {existingReport ? "Update report" : "Report"}
            </button>
          </div>
          <p className="hint">Blocking only hides the piece in this browser. It does not notify anyone.</p>
          {existingReport && !reporting ? (
            <p className="meta">A report for this piece is saved on this device: {existingReport.reason}.</p>
          ) : null}
          {reporting ? (
            <form onSubmit={saveReport} noValidate>
              {reportError ? <p className="field-error">{reportError}</p> : null}
              <fieldset>
                <legend>What is the concern?</legend>
                {REPORT_REASONS.map((item) => (
                  <label key={item} className="check">
                    <input type="radio" name="reason" checked={reason === item} onChange={() => setReason(item)} />
                    <span>{item}</span>
                  </label>
                ))}
              </fieldset>
              <div className="field">
                <label htmlFor="report-note">Optional note</label>
                <textarea id="report-note" maxLength={280} value={note} onChange={(event) => setNote(event.target.value)} />
                <p className="hint">{note.trim().length} / 280. This note stays in your browser.</p>
              </div>
              <div className="cluster">
                <button className="btn" type="submit">
                  Save report on this device
                </button>
                <button className="btn quiet" type="button" onClick={() => setReporting(false)}>
                  Cancel
                </button>
              </div>
            </form>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function PageNotice({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="card">
      <h1>{title}</h1>
      {children}
    </section>
  );
}
