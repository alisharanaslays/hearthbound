import { NextResponse } from "next/server";

const REASON =
  "Publishing is closed. This server has no accounts, no age assurance, and no human review. Artwork and stories stay off the public site until those exist. An age sent with a request is ignored and is never treated as proof of age.";

export async function POST(request: Request) {
  let hadAge = false;
  try {
    const body = (await request.json()) as unknown;
    hadAge = Boolean(body && typeof body === "object" && "age" in body);
  } catch {
    hadAge = false;
  }

  return NextResponse.json(
    {
      published: false,
      acceptedAge: false,
      ignoredAgeField: hadAge,
      reason: REASON,
    },
    { status: 403, headers: { "Cache-Control": "no-store" } },
  );
}

export async function GET() {
  return NextResponse.json(
    {
      items: [],
      reason: "The server has no visitor artwork. The gallery on this site is sample art bundled with the prototype.",
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
