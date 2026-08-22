import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { isPrintTicket, PRINT_PRICE_CENTS } from "@/lib/print-ticket";

export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    return NextResponse.json(
      { error: "Paiement non configuré. Ajoutez STRIPE_SECRET_KEY." },
      { status: 500 },
    );
  }

  let body: { ticket?: string; reference?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const ticket = body.ticket?.trim() ?? "";
  const reference = body.reference?.trim() || "Verset";
  if (!isPrintTicket(ticket)) {
    return NextResponse.json({ error: "Sélection invalide." }, { status: 400 });
  }

  const stripe = new Stripe(secret);
  const origin = request.headers.get("origin") || request.nextUrl.origin;

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    locale: "fr",
    currency: "eur",
    payment_method_types: ["card"],
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "eur",
          unit_amount: PRINT_PRICE_CENTS,
          product_data: {
            name: "Bible Print - toutes tailles et formats",
            description: `${reference}. Un paiement : toutes les tailles, vertical et horizontal.`,
          },
        },
      },
    ],
    metadata: { ticket, reference },
    success_url: `${origin}/?checkout={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/?cancel=1`,
  });

  if (!session.url) {
    return NextResponse.json({ error: "Impossible d’ouvrir le paiement." }, { status: 500 });
  }

  return NextResponse.json({ url: session.url });
}
