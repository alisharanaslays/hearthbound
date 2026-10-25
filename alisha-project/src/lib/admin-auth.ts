import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const ADMIN_COOKIE = "hb_admin";

export function adminSecret() {
  const secret = process.env.ADMIN_SECRET?.trim() ?? "";
  return secret.length >= 8 ? secret : "";
}

export function adminReady() {
  return Boolean(adminSecret());
}

export function adminToken(secret = adminSecret()) {
  return createHmac("sha256", secret).update("hearthbound-admin-v1").digest("base64url");
}

function same(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function secretMatches(input: string) {
  const secret = adminSecret();
  if (!secret || !input) return false;
  return same(input, secret);
}

export async function isAdmin() {
  if (!adminReady()) return false;
  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE)?.value ?? "";
  return same(token, adminToken());
}

export async function denyAdmin() {
  if (!adminReady()) {
    return NextResponse.json({ error: "The site desk has no secret yet. Add ADMIN_SECRET and restart the server." }, { status: 503 });
  }
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Sign in to the site desk first." }, { status: 401 });
  }
  return null;
}

export function adminCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  };
}
