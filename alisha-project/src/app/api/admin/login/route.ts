import { NextResponse } from "next/server";
import { ADMIN_COOKIE, adminCookieOptions, adminReady, adminToken, secretMatches } from "@/lib/admin-auth";

const failures = new Map<string, { count: number; until: number }>();

function clientKey(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || "local";
}

export async function POST(request: Request) {
  if (!adminReady()) {
    return NextResponse.json({ error: "The site desk has no secret yet. Add ADMIN_SECRET and restart the server." }, { status: 503 });
  }
  const key = clientKey(request);
  const now = Date.now();
  const attempt = failures.get(key);
  if (attempt && attempt.until > now && attempt.count >= 8) {
    return NextResponse.json({ error: "Too many tries. Wait a few minutes, then try the secret again." }, { status: 429 });
  }

  let secret = "";
  try {
    const body = (await request.json()) as { secret?: unknown };
    secret = typeof body.secret === "string" ? body.secret : "";
  } catch {
    secret = "";
  }

  if (!secretMatches(secret)) {
    const count = attempt && attempt.until > now ? attempt.count + 1 : 1;
    failures.set(key, { count, until: now + 15 * 60 * 1000 });
    return NextResponse.json({ error: "That secret does not match." }, { status: 401 });
  }

  failures.delete(key);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, adminToken(), adminCookieOptions());
  return response;
}
