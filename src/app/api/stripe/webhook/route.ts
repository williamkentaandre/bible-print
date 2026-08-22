import { NextRequest, NextResponse } from "next/server";
import { parseLocale } from "@/i18n";
import { sendReadyEmail } from "@/lib/mail";
import { getStripe } from "@/lib/stripe-client";

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: "Webhook non configuré." }, { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Signature manquante." }, { status: 400 });
  }

  const payload = await request.text();
  let event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Signature invalide." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    if (session.payment_status === "paid") {
      const email =
        session.metadata?.email ||
        session.customer_details?.email ||
        session.customer_email ||
        "";
      if (email) {
        const origin = process.env.NEXT_PUBLIC_SITE_URL || "https://bibledeco.com";
        const reference = session.metadata?.reference || "Votre verset";
        try {
          await sendReadyEmail(email, origin, reference, parseLocale(session.metadata?.locale));
        } catch {
          // ignore
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
