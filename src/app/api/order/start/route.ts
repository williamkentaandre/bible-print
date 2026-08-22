import { NextRequest, NextResponse } from "next/server";
import { getCopy, parseLocale } from "@/i18n";
import { sendLoginEmail } from "@/lib/mail";
import { createCheckout, hasPaidTicket, listPaidOrders } from "@/lib/orders";
import { isPrintTicket } from "@/lib/print-ticket";
import { isEmail, normalizeEmail } from "@/lib/session";
import { isStripeConfigured } from "@/lib/stripe-client";

export async function POST(request: NextRequest) {
  let body: {
    email?: string;
    ticket?: string;
    reference?: string;
    intent?: string;
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

  const origin = request.headers.get("origin") || request.nextUrl.origin;
  const intent = body.intent === "login" ? "login" : "buy";

  if (intent === "login") {
    const orders = await listPaidOrders(email);
    if (isStripeConfigured() && orders.length === 0) {
      return NextResponse.json({ error: copy.api.noOrders }, { status: 404 });
    }
    const sent = await sendLoginEmail(email, origin, locale);
    return NextResponse.json({
      sent,
      message: sent ? copy.api.linkSent : copy.api.emailNotConfigured,
    });
  }

  const ticket = body.ticket?.trim() ?? "";
  const reference = body.reference?.trim() || copy.api.verseFallback;
  if (!isPrintTicket(ticket)) {
    return NextResponse.json({ error: copy.api.badSelection }, { status: 400 });
  }

  if (await hasPaidTicket(email, ticket)) {
    const sent = await sendLoginEmail(email, origin, locale);
    return NextResponse.json({
      alreadyPaid: true,
      sent,
      message: sent ? copy.api.alreadyYoursSent : copy.api.alreadyYoursOpen,
    });
  }

  if (!isStripeConfigured()) {
    return NextResponse.json({ error: copy.api.payClosed }, { status: 503 });
  }

  try {
    const url = await createCheckout({ email, ticket, reference, origin, locale });
    return NextResponse.json({ url });
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : copy.api.payImpossible;
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
