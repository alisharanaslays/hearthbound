"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Notice } from "../ui";

export function LoginForm() {
  const router = useRouter();
  const [secret, setSecret] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret }),
    });
    const data = (await response.json().catch(() => ({}))) as { error?: string };
    setPending(false);
    if (!response.ok) {
      setError(data.error || "The desk could not open.");
      return;
    }
    router.replace("/admin");
    router.refresh();
  }

  return (
    <form className="card desk-card" onSubmit={submit} noValidate>
      <p>This door is for the person running the site. It is one shared secret, not an account for visitors.</p>
      {error ? <Notice tone="error">{error}</Notice> : null}
      <div className="field">
        <label htmlFor="admin-secret">Desk secret</label>
        <input
          id="admin-secret"
          type={show ? "text" : "password"}
          autoComplete="current-password"
          value={secret}
          onChange={(event) => setSecret(event.target.value)}
          required
        />
      </div>
      <label className="check">
        <input type="checkbox" checked={show} onChange={(event) => setShow(event.target.checked)} />
        <span>Show the secret</span>
      </label>
      <button className="btn primary" type="submit" disabled={pending}>
        {pending ? "Checking…" : "Open the desk"}
      </button>
    </form>
  );
}
