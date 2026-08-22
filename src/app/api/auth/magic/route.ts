import { NextRequest, NextResponse } from "next/server";
import { getCopy, parseLocale } from "@/i18n";
import { readMagicToken, setSessionEmail } from "@/lib/session";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token") ?? "";
  const email = readMagicToken(token);
  const copy = getCopy(parseLocale(request.nextUrl.searchParams.get("locale")));
  const dest = new URL(copy.paths.prints, request.nextUrl.origin);
  if (!email) {
    dest.searchParams.set("error", "lien");
    return NextResponse.redirect(dest);
  }
  await setSessionEmail(email);
  return NextResponse.redirect(dest);
}
