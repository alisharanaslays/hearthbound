"use client";

export async function deskSend(url: string, method: string, body?: unknown) {
  const response = await fetch(url, {
    method,
    headers: body === undefined ? undefined : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = (await response.json().catch(() => ({}))) as { error?: string };
  if (response.status === 401) {
    window.location.href = "/admin/login";
    return { ok: false as const, error: "Sign in again to keep editing." };
  }
  if (!response.ok) return { ok: false as const, error: data.error || "The desk could not save that." };
  return { ok: true as const };
}
