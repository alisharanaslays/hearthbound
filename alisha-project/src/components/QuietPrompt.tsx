"use client";

import { useEffect, useState } from "react";

const PROMPTS = [
  "Reread a page you already love, slowly.",
  "Draw a room a character would hide in.",
  "Write one sentence you wish a book had said.",
  "Notice a color on a cover and find it in the room.",
  "Tell a story in four pictures and no more.",
  "Leave a book open where tomorrow-you will see it.",
  "Invent a kind creature who keeps a library.",
  "Copy a line by hand, then close the book and remember it.",
];

export function QuietPrompt() {
  const [prompt, setPrompt] = useState<string | null>(null);

  useEffect(() => {
    setPrompt(PROMPTS[new Date().getDate() % PROMPTS.length]);
  }, []);

  return (
    <p className="card" style={{ marginTop: "1.5rem" }}>
      <span className="eyebrow">A quiet prompt</span>
      <br />
      {prompt ?? "A small invitation is on its way."}
    </p>
  );
}
