import { NextResponse } from "next/server";
import { denyAdmin } from "@/lib/admin-auth";
import { addGenre, createBook, deleteBook, removeGenre, updateBook } from "@/lib/site";

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
  const body = (await readBody(request)) as { kind?: unknown; name?: unknown } | null;
  const result = body?.kind === "genre" ? await addGenre(typeof body.name === "string" ? body.name : "") : await createBook(body);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function PUT(request: Request) {
  const denied = await denyAdmin();
  if (denied) return denied;
  const result = await updateBook(await readBody(request));
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const denied = await denyAdmin();
  if (denied) return denied;
  const url = new URL(request.url);
  const id = url.searchParams.get("id") ?? "";
  const genre = url.searchParams.get("genre");
  const result = genre !== null ? await removeGenre(genre) : await deleteBook(id);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true });
}
