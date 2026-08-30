import { NextRequest, NextResponse } from "next/server";
import { getCopy, parseLocale } from "@/i18n";
import { saveContact } from "@/lib/contacts";
import { sendFreeDownloadEmail } from "@/lib/mail";
import { isFreeVerse, isPrintTicket, parseTicket } from "@/lib/print-ticket";
import { isEmail, normalizeEmail, setSessionEmail } from "@/lib/session";

export async function POST(request: NextRequest) {
  let body: {
    email?: string;
    ticket?: string;
    reference?: string;
    locale?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: getCopy("fr").api.badRequest }, { status: 400 });
  }

  const locale = parseLocale(body.locale);
  const copy = getCopy(locale);
  const email = normalizeEmail(body.email ?? "");
  if (!isEmail(email)) {
    return NextResponse.json({ error: copy.api.badEmail }, { status: 400 });
  }

  const ticket = body.ticket?.trim() ?? "";
  if (!isPrintTicket(ticket)) {
    return NextResponse.json({ error: copy.api.badSelection }, { status: 400 });
  }

  const choice = parseTicket(ticket);
  if (!choice || !isFreeVerse(choice)) {
    return NextResponse.json({ error: copy.api.paidVerse }, { status: 400 });
  }

  const reference = body.reference?.trim() || copy.api.verseFallback;
  const origin = request.headers.get("origin") || request.nextUrl.origin;

  await saveContact({
    email,
    locale,
    source: "free_download",
    reference,
  });

  await setSessionEmail(email);

  const sent = await sendFreeDownloadEmail(email, origin, reference, locale, ticket);

  return NextResponse.json({
    ok: true,
    sent,
    message: sent ? copy.freeDownloadSent : copy.api.emailNotConfigured,
  });
}
