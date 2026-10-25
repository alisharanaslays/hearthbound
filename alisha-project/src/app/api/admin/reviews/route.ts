import { NextResponse } from "next/server";
import { denyAdmin } from "@/lib/admin-auth";
import { createReview, deleteReview, updateReview } from "@/lib/site";

export const runtime = "nodejs";

async function readBody(request: Request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const denied = await denyAdmin();
  if (denied) return denied;
  const result = await createReview(await readBody(request));
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function PUT(request: Request) {
  const denied = await denyAdmin();
  if (denied) return denied;
  const result = await updateReview(await readBody(request));
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const denied = await denyAdmin();
  if (denied) return denied;
  const id = new URL(request.url).searchParams.get("id") ?? "";
  const result = await deleteReview(id);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}
