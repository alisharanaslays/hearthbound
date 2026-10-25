"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ART_CATEGORIES, SAMPLE_ART } from "@/lib/art";
import { useStore } from "@/lib/use-store";
import { ArtworkMotif } from "./ArtworkMotif";
import { PageHeader } from "./PageHeader";

export function ArtGallery() {
  const { store, ready } = useStore();
  const [category, setCategory] = useState<string>("All");
  const [serverNote, setServerNote] = useState("Checking the publication shelf…");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/publications")
      .then((response) => response.json())
      .then((data: { reason?: string }) => {
        if (!cancelled) setServerNote(data.reason ?? "The server returned an empty shelf.");
      })
      .catch(() => {
        if (!cancelled) setServerNote("The publication service could not be reached. You are seeing sample artwork only.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const hidden = new Set(store?.hiddenArtIds ?? []);
  const visible = SAMPLE_ART.filter((art) => !hidden.has(art.id)).filter((art) => category === "All" || art.category === category);

  return (
    <div className="wrap page">
      <PageHeader
        eyebrow="Sample gallery"
        title="Art Hub"
        lede="Eight original placeholders, made for this prototype. They are not uploads from real people, and they are not sorted into age spaces. Open a piece to leave a little sunshine. Counts stay off the gallery."
      >
        <p className="prototype-note">{serverNote}</p>
        <Link className="btn primary" href="/art/new">
          Submit artwork
        </Link>
        <Link className="btn" href="/sketchbook">
          Open The Sketchbook
        </Link>
      </PageHeader>
      <div className="segment" role="group" aria-label="Artwork categories">
        {["All", ...ART_CATEGORIES].map((item) => (
          <button key={item} type="button" aria-pressed={category === item} onClick={() => setCategory(item)}>
            {item}
          </button>
        ))}
      </div>
      {!ready ? <p role="status">Opening the gallery…</p> : null}
      {ready && visible.length === 0 ? (
        <div className="card empty" style={{ marginTop: "1rem" }}>
          <h2>Nothing in this view.</h2>
          <p>You may have blocked every piece here. You can bring them back from My Library.</p>
          <Link className="btn" href="/library">
            Go to My Library
          </Link>
        </div>
      ) : (
        <div className="art-grid" style={{ marginTop: "1rem" }}>
          {visible.map((art) => (
            <Link key={art.id} href={`/art/${art.id}`} className="card art-card">
              <div className="frame">
                <ArtworkMotif motif={art.motif} />
              </div>
              <h2>{art.title}</h2>
              <p className="clamp">{art.description}</p>
              <p className="meta">
                by {art.artist} · {art.category} · Sample
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
