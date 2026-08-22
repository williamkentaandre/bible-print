import { NextRequest, NextResponse } from "next/server";
import { parseLocale } from "@/i18n";
import { sendReadyEmail } from "@/lib/mail";
import { getStripe } from "@/lib/stripe-client";
import { setSessionEmail } from "@/lib/session";

export async function GET(request: NextRequest) {
  const stripe = getStripe();
  const sessionId = request.nextUrl.searchParams.get("session_id");
  if (!stripe || !sessionId) {
    return NextResponse.json({ paid: false }, { status: 400 });
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (session.payment_status !== "paid") {
    return NextResponse.json({ paid: false });
  }

  const email =
    session.metadata?.email ||
    session.customer_details?.email ||
    session.customer_email ||
    "";
  if (email) {
    await setSessionEmail(email);
    const origin = request.nextUrl.origin;
    const reference = session.metadata?.reference || "Votre verset";
    try {
      await sendReadyEmail(email, origin, reference, parseLocale(session.metadata?.locale));
    } catch {
      // Le lien reste disponible dans Mes impressions.
    }
  }

  return NextResponse.json({
    paid: true,
    ticket: session.metadata?.ticket ?? null,
    email: email || null,
  });
}
