"use client";

import Link from "next/link";
import { useStore } from "@/lib/use-store";
import { ReviewLegend, SketchBadge } from "./SketchStatus";

export function SketchGallery() {
  const { store, ready } = useStore();
  const sketches = store?.sketches ?? [];

  return (
    <div className="wrap page sketchbook">
      <header className="page-header">
        <p className="eyebrow">This browser only</p>
        <h1>My Creations</h1>
        <p className="lede">Drawings and uploads saved here stay private. Approved Art Hub pieces are a different shelf, and this page does not add to it.</p>
        <Link className="btn quiet" href="/sketchbook">
          Back to The Sketchbook
        </Link>
      </header>
      <ReviewLegend />
      {!ready ? <p role="status">Opening your sketchbook…</p> : null}
      {ready && sketches.length === 0 ? (
        <div className="card empty">
          <h2>No creations yet.</h2>
          <p>Start a drawing or upload a picture. It will be listed here, on this device.</p>
          <div className="cluster">
            <Link className="btn primary" href="/sketchbook/draw">
              Start Drawing
            </Link>
            <Link className="btn" href="/sketchbook/upload">
              Upload Artwork
            </Link>
          </div>
        </div>
      ) : (
        <div className="art-grid">
          {sketches.map((item) => (
            <Link key={item.id} href={`/sketchbook/creations/${item.id}`} className="card art-card">
              <div className="frame sketch-frame">
                {item.imageDataUrl ? (
                  <img src={item.imageDataUrl} alt="" />
                ) : (
                  <p>Drawing saved without a preview.</p>
                )}
              </div>
              <h2>{item.title}</h2>
              <p className="meta">
                {item.kind === "drawing" ? "Drawing" : "Upload"} · {item.category}
              </p>
              <SketchBadge item={item} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
