import { NextRequest, NextResponse } from "next/server";
import { sameSecret, setStudioSession, studioSecret } from "@/lib/studio-auth";

export async function POST(request: NextRequest) {
  const expected = studioSecret();
  if (!expected) {
    return NextResponse.json({ error: "Studio non configuré." }, { status: 503 });
  }

  const body = (await request.json().catch(() => null)) as { secret?: unknown } | null;
  const given = typeof body?.secret === "string" ? body.secret.trim() : "";
  if (!sameSecret(given, expected)) {
    return NextResponse.json({ error: "Mot de passe incorrect." }, { status: 401 });
  }

  await setStudioSession();
  return NextResponse.json({ ok: true });
}
