"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { LIMITS } from "@/lib/storage";
import { askToPublish, BRUSH_SIZES, INK_COLORS, PAPER, SKETCH_CATEGORIES, SKETCH_LIMITS, toArtCategory } from "@/lib/sketch";
import type { SketchCategory, SketchItem, SketchStroke } from "@/lib/types";
import { useStore } from "@/lib/use-store";
import { ConfirmButton } from "./ui";
import { Notice } from "./ui";
import { SketchBadge } from "./SketchStatus";

function paint(ctx: CanvasRenderingContext2D, strokes: SketchStroke[], live: SketchStroke | null) {
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, PAPER.width, PAPER.height);
  for (const stroke of live ? [...strokes, live] : strokes) {
    const [first] = stroke.points;
    if (!first) continue;
    ctx.beginPath();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = stroke.size;
    ctx.strokeStyle = stroke.tool === "eraser" ? "#ffffff" : stroke.color;
    ctx.moveTo(first[0], first[1]);
    if (stroke.points.length === 1) ctx.lineTo(first[0] + 0.4, first[1]);
    else stroke.points.slice(1).forEach(([x, y]) => ctx.lineTo(x, y));
    ctx.stroke();
  }
}

function previewJpeg(source: HTMLCanvasElement) {
  const max = 900;
  const scale = Math.min(1, max / source.width);
  const copy = document.createElement("canvas");
  copy.width = Math.max(1, Math.round(source.width * scale));
  copy.height = Math.max(1, Math.round(source.height * scale));
  const ctx = copy.getContext("2d");
  if (!ctx) throw new Error("This browser could not prepare the preview.");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, copy.width, copy.height);
  ctx.drawImage(source, 0, 0, copy.width, copy.height);
  const url = copy.toDataURL("image/jpeg", 0.72);
  if (url.length > 1_000_000) {
    throw new Error("This drawing is too heavy to store in this browser. Undo a little, or start a fresh page.");
  }
  return url;
}

export function DrawingStudio({ id, justSaved }: { id: string | null; justSaved: boolean }) {
  const router = useRouter();
  const { store, ready, update } = useStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const liveRef = useRef<SketchStroke | null>(null);
  const [strokes, setStrokes] = useState<SketchStroke[]>([]);
  const [future, setFuture] = useState<SketchStroke[]>([]);
  const [tool, setTool] = useState<"pen" | "eraser">("pen");
  const [color, setColor] = useState(INK_COLORS[0]);
  const [size, setSize] = useState(BRUSH_SIZES[1]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<SketchCategory>("Original Art");
  const [notice, setNotice] = useState(justSaved ? "Saved in this browser." : "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [opened, setOpened] = useState(!id);
  const loaded = useRef(false);
  const strokesRef = useRef(strokes);
  const futureRef = useRef(future);
  strokesRef.current = strokes;
  futureRef.current = future;

  const existing = store?.sketches.find((item) => item.id === id);

  useEffect(() => {
    if (!ready || !store || loaded.current) return;
    loaded.current = true;
    if (id) {
      const item = store.sketches.find((sketch) => sketch.id === id);
      if (item?.kind === "drawing" && item.strokes) {
        setStrokes(item.strokes);
        setTitle(item.title);
        setDescription(item.description);
        setCategory(item.category);
      }
    }
    setOpened(true);
  }, [ready, store, id]);

  const bindCanvas = useCallback((node: HTMLCanvasElement | null) => {
    canvasRef.current = node;
    const ctx = node?.getContext("2d");
    if (!node || !ctx) return;
    paint(ctx, strokesRef.current, liveRef.current);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    paint(ctx, strokes, null);
  }, [strokes]);

  function point(event: React.PointerEvent<HTMLCanvasElement>): [number, number] {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.round(((event.clientX - rect.left) / rect.width) * PAPER.width);
    const y = Math.round(((event.clientY - rect.top) / rect.height) * PAPER.height);
    return [Math.min(PAPER.width, Math.max(0, x)), Math.min(PAPER.height, Math.max(0, y))];
  }

  function drawLive() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    paint(ctx, strokes, liveRef.current);
  }

  function start(event: React.PointerEvent<HTMLCanvasElement>) {
    if (strokes.length >= SKETCH_LIMITS.strokes) {
      setError("This page is full. Save it, then start another drawing.");
      return;
    }
    event.currentTarget.setPointerCapture(event.pointerId);
    liveRef.current = { tool, color, size, points: [point(event)] };
    drawLive();
  }

  function move(event: React.PointerEvent<HTMLCanvasElement>) {
    const live = liveRef.current;
    if (!live || !event.currentTarget.hasPointerCapture(event.pointerId)) return;
    if (live.points.length >= SKETCH_LIMITS.points) return;
    live.points.push(point(event));
    drawLive();
  }

  function end(event: React.PointerEvent<HTMLCanvasElement>) {
    const live = liveRef.current;
    liveRef.current = null;
    if (!live || live.points.length === 0) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setStrokes((current) => [...current, live]);
    setFuture([]);
    setError("");
  }

  function undo() {
    const last = strokesRef.current.at(-1);
    if (!last) return;
    const nextStrokes = strokesRef.current.slice(0, -1);
    const nextFuture = [...futureRef.current, last];
    strokesRef.current = nextStrokes;
    futureRef.current = nextFuture;
    setStrokes(nextStrokes);
    setFuture(nextFuture);
  }

  function redo() {
    const last = futureRef.current.at(-1);
    if (!last) return;
    const nextFuture = futureRef.current.slice(0, -1);
    const nextStrokes = [...strokesRef.current, last];
    strokesRef.current = nextStrokes;
    futureRef.current = nextFuture;
    setStrokes(nextStrokes);
    setFuture(nextFuture);
  }

  function clearPage() {
    liveRef.current = null;
    setStrokes([]);
    setFuture([]);
    setError("");
  }

  function download() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const name = (title.trim() || "sketch").replace(/[^\w\s-]+/g, "").trim() || "sketch";
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = `${name}.png`;
    link.click();
  }

  function buildItem(preview: string): SketchItem | string {
    const cleanTitle = title.trim();
    if (cleanTitle.length < 2) return "Add a title of at least two characters.";
    if (strokes.length === 0) return "Draw something before saving.";
    const now = new Date().toISOString();
    return {
      id: id ?? crypto.randomUUID(),
      kind: "drawing",
      title: cleanTitle.slice(0, SKETCH_LIMITS.title),
      description: description.trim().slice(0, SKETCH_LIMITS.description),
      category,
      strokes,
      imageDataUrl: preview,
      askedReview: existing?.askedReview ?? false,
      reviewReply: existing?.reviewReply,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
  }

  function saveDrawing() {
    setError("");
    const canvas = canvasRef.current;
    if (!canvas) return null;
    let preview = "";
    try {
      preview = previewJpeg(canvas);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The preview could not be made.");
      return null;
    }
    const item = buildItem(preview);
    if (typeof item === "string") {
      setError(item);
      document.getElementById("sketch-title")?.focus();
      return null;
    }
    let blocked = false;
    const result = update((current) => {
      const rest = current.sketches.filter((sketch) => sketch.id !== item.id);
      const known = current.sketches.some((sketch) => sketch.id === item.id);
      if (!known && current.sketches.length >= LIMITS.sketches) {
        blocked = true;
        return current;
      }
      return { ...current, sketches: [item, ...rest] };
    });
    if (blocked) {
      setError(`You can keep ${LIMITS.sketches} sketchbook pieces on this device. Remove one from My Creations first.`);
      return null;
    }
    if (!result.ok) {
      setError(result.message ?? "This browser could not store that drawing.");
      return null;
    }
    setNotice("Saved in this browser. It is private, and it is not in Art Hub.");
    if (item.id !== id) router.replace(`/sketchbook/draw?id=${item.id}&saved=1`);
    return item;
  }

  async function submit() {
    const item = saveDrawing();
    if (!item?.imageDataUrl) return;
    setBusy(true);
    const reply = await askToPublish();
    const libraryFull = Boolean(
      store && !store.submissions.some((art) => art.id === item.id) && store.submissions.length >= LIMITS.submissions,
    );
    const note = libraryFull ? `${reply} My Library's private list is full, so that list did not get a copy.` : reply;
    const next: SketchItem = { ...item, askedReview: true, reviewReply: note, updatedAt: new Date().toISOString() };
    const result = update((current) => {
      const rest = current.sketches.filter((sketch) => sketch.id !== next.id);
      const already = current.submissions.some((art) => art.id === next.id);
      const room = already || current.submissions.length < LIMITS.submissions;
      const submissions = room
        ? [
            {
              id: next.id,
              title: next.title,
              description: next.description || "A private piece from The Sketchbook.",
              category: toArtCategory(next.category),
              imageDataUrl: next.imageDataUrl,
              createdAt: next.createdAt,
            },
            ...current.submissions.filter((art) => art.id !== next.id),
          ]
        : current.submissions;
      return { ...current, sketches: [next, ...rest], submissions };
    });
    setBusy(false);
    if (!result.ok) {
      setError(result.message ?? "The private copy could not be stored.");
      return;
    }
    setNotice(note);
  }

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "z") return;
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT")) return;
      event.preventDefault();
      if (event.shiftKey) redo();
      else undo();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!ready || !opened) {
    return (
      <div className="wrap page sketchbook">
        <p role="status">Opening the page…</p>
      </div>
    );
  }

  if (id && existing && existing.kind !== "drawing") {
    return (
      <div className="wrap page sketchbook">
        <Notice>That creation is an upload, so it opens as a picture rather than a drawing.</Notice>
        <Link className="btn" href={`/sketchbook/creations/${id}`}>
          Open it
        </Link>
      </div>
    );
  }

  if (id && !existing) {
    return (
      <div className="wrap page sketchbook">
        <Notice tone="error">That drawing is not saved in this browser.</Notice>
        <Link className="btn" href="/sketchbook/draw">
          Start a new drawing
        </Link>
      </div>
    );
  }

  return (
    <div className="wrap page sketchbook">
      <header className="page-header">
        <p className="eyebrow">Blank page</p>
        <h1>Start Drawing</h1>
        <p className="lede">Use a mouse, trackpad, or finger. The page stays on this device until you download it.</p>
        <Link className="btn quiet" href="/sketchbook">
          Back to The Sketchbook
        </Link>
      </header>
      {notice ? <Notice tone="good">{notice}</Notice> : null}
      {error ? <Notice tone="error">{error}</Notice> : null}
      {existing ? <SketchBadge item={existing} /> : null}
      {existing?.reviewReply ? <p className="prototype-note">{existing.reviewReply}</p> : null}
      <div className="draw-layout">
        <div className="card draw-tools">
          <fieldset>
            <legend>Tool</legend>
            <div className="cluster">
              <button type="button" className="btn" aria-pressed={tool === "pen"} onClick={() => setTool("pen")}>
                Brush
              </button>
              <button type="button" className="btn" aria-pressed={tool === "eraser"} onClick={() => setTool("eraser")}>
                Eraser
              </button>
            </div>
          </fieldset>
          <fieldset>
            <legend>Color</legend>
            <div className="swatches">
              {INK_COLORS.map((ink) => (
                <button
                  key={ink}
                  type="button"
                  className="ink-swatch"
                  style={{ background: ink }}
                  aria-label={`Ink ${ink}`}
                  aria-pressed={color === ink && tool === "pen"}
                  onClick={() => {
                    setColor(ink);
                    setTool("pen");
                  }}
                />
              ))}
              <label className="ink-swatch custom-ink">
                <span className="sr-only">Custom color</span>
                <input
                  type="color"
                  value={color}
                  aria-label="Custom color"
                  onChange={(event) => {
                    setColor(event.target.value);
                    setTool("pen");
                  }}
                />
              </label>
            </div>
          </fieldset>
          <fieldset>
            <legend>Brush size</legend>
            <div className="cluster">
              {BRUSH_SIZES.map((brush) => (
                <button key={brush} type="button" className="btn" aria-pressed={size === brush} onClick={() => setSize(brush)}>
                  {brush}
                </button>
              ))}
            </div>
          </fieldset>
          <div className="cluster">
            <button type="button" className="btn" onClick={undo} disabled={strokes.length === 0}>
              Undo
            </button>
            <button type="button" className="btn" onClick={redo} disabled={future.length === 0}>
              Redo
            </button>
            <ConfirmButton label="Clear canvas" prompt="Clear the whole page?" confirmLabel="Clear it" onConfirm={clearPage} />
          </div>
        </div>
        <div className="paper-frame">
          <canvas
            ref={bindCanvas}
            width={PAPER.width}
            height={PAPER.height}
            className="paper"
            role="img"
            aria-label="Drawing canvas"
            onPointerDown={start}
            onPointerMove={move}
            onPointerUp={end}
            onPointerCancel={end}
          />
        </div>
      </div>
      <form
        className="card stack"
        style={{ marginTop: "1rem" }}
        onSubmit={(event) => {
          event.preventDefault();
          saveDrawing();
        }}
      >
        <div>
          <label htmlFor="sketch-title">Title</label>
          <input id="sketch-title" value={title} maxLength={SKETCH_LIMITS.title} onChange={(event) => setTitle(event.target.value)} />
        </div>
        <div>
          <label htmlFor="sketch-description">Description, optional</label>
          <textarea
            id="sketch-description"
            value={description}
            maxLength={SKETCH_LIMITS.description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>
        <div>
          <label htmlFor="sketch-category">Category</label>
          <select id="sketch-category" value={category} onChange={(event) => setCategory(event.target.value as SketchCategory)}>
            {SKETCH_CATEGORIES.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>
        <div className="cluster">
          <button className="btn primary" type="submit">
            Save on this device
          </button>
          <button className="btn" type="button" onClick={download}>
            Download image
          </button>
          <button className="btn" type="button" onClick={submit} disabled={busy}>
            {busy ? "Asking…" : "Submit to Art Hub"}
          </button>
          <Link className="btn quiet" href="/sketchbook/creations">
            My Creations
          </Link>
        </div>
        <p className="hint">
          Submit to Art Hub keeps a private copy and asks the server. The server still refuses publication, so the status
          stays Draft. Pending Review, Approved, and Needs Changes are not available.
        </p>
      </form>
    </div>
  );
}
