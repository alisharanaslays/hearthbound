import { NextResponse } from "next/server";
import { denyAdmin } from "@/lib/admin-auth";
import { resetAppearance, saveAppearance } from "@/lib/site";

export const runtime = "nodejs";

export async function PUT(request: Request) {
  const denied = await denyAdmin();
  if (denied) return denied;
  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Nothing to save." }, { status: 400 });
  }
  const result = await saveAppearance(body);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const denied = await denyAdmin();
  if (denied) return denied;
  const result = await resetAppearance();
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}
