import { NextRequest, NextResponse } from "next/server";
import { getCopy, parseLocale } from "@/i18n";
import { readMagicToken, setSessionEmail } from "@/lib/session";

function safeRedirect(next: string | null, locale: ReturnType<typeof parseLocale>) {
  const copy = getCopy(locale);
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return copy.paths.home;
  }
  return next;
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token") ?? "";
  const email = readMagicToken(token);
  const locale = parseLocale(request.nextUrl.searchParams.get("locale"));
  const next = request.nextUrl.searchParams.get("next");
  const copy = getCopy(locale);
  const dest = new URL(safeRedirect(next, locale), request.nextUrl.origin);
  if (!email) {
    dest.searchParams.set("error", "lien");
    return NextResponse.redirect(dest);
  }
  await setSessionEmail(email);
  return NextResponse.redirect(dest);
}
