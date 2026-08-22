import { NextRequest, NextResponse } from "next/server";
import { readMagicToken, setSessionEmail } from "@/lib/session";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token") ?? "";
  const email = readMagicToken(token);
  const dest = new URL("/mes-impressions", request.nextUrl.origin);
  if (!email) {
    dest.searchParams.set("error", "lien");
    return NextResponse.redirect(dest);
  }
  await setSessionEmail(email);
  return NextResponse.redirect(dest);
}
