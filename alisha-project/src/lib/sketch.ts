import type { ArtCategory, SketchCategory } from "./types";

export const SKETCH_CATEGORIES: SketchCategory[] = [
  "Book Fan Art",
  "Fantasy",
  "Nature",
  "Original Art",
  "Other",
];

export const SKETCH_LIMITS = {
  items: 12,
  strokes: 160,
  points: 700,
  title: 80,
  description: 400,
};

export const PAPER = { width: 1100, height: 760 };

export const INK_COLORS = ["#2a2420", "#2f6f6a", "#4d3f6b", "#a85d73", "#3d6b4f", "#8a6244", "#d4537e"];

export const BRUSH_SIZES = [3, 8, 16, 28];

export function toArtCategory(category: SketchCategory): ArtCategory {
  if (category === "Fantasy") return "Fantasy";
  if (category === "Nature") return "Animals";
  if (category === "Book Fan Art") return "Characters";
  return "Magical worlds";
}

export function sketchFileError(file: { type: string; size: number }) {
  const allowed = ["image/png", "image/jpeg", "image/webp"];
  if (!allowed.includes(file.type)) {
    return "Choose a PNG, JPEG, or WebP image.";
  }
  if (file.size > 8 * 1024 * 1024) {
    return "That file is larger than 8 MB. Choose a smaller picture.";
  }
  if (file.size === 0) {
    return "That file is empty. Choose a different picture.";
  }
  return "";
}

export async function askToPublish() {
  try {
    const response = await fetch("/api/publications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "artwork", source: "sketchbook" }),
    });
    const data = (await response.json()) as { published?: boolean; reason?: string };
    if (data.published === true) {
      return "The server said this was published. Refresh Art Hub before trusting that message.";
    }
    return data.reason ?? "The server did not accept this artwork, so it stays private on this device.";
  } catch {
    return "Saved on this device. The server could not be reached, so nothing was sent for review.";
  }
}
