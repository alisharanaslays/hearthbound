"use client";

import { useState, type ReactNode } from "react";

export function Notice({
  tone = "info",
  children,
}: {
  tone?: "info" | "error" | "good";
  children: ReactNode;
}) {
  return (
    <div className={`notice ${tone === "info" ? "" : tone}`} role={tone === "error" ? "alert" : "status"}>
      {children}
    </div>
  );
}

export function ConfirmButton({
  label,
  prompt,
  confirmLabel,
  onConfirm,
}: {
  label: string;
  prompt: string;
  confirmLabel: string;
  onConfirm: () => void;
}) {
  const [open, setOpen] = useState(false);
  if (!open) {
    return (
      <button type="button" className="btn quiet" onClick={() => setOpen(true)}>
        {label}
      </button>
    );
  }
  return (
    <span className="confirm">
      <span>{prompt}</span>
      <button type="button" className="btn" onClick={onConfirm}>
        {confirmLabel}
      </button>
      <button type="button" className="btn quiet" onClick={() => setOpen(false)}>
        Keep
      </button>
    </span>
  );
}
