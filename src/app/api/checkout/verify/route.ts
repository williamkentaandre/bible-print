import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function GET(request: NextRequest) {
  const secret = process.env.STRIPE_SECRET_KEY;
  const sessionId = request.nextUrl.searchParams.get("session_id");
  if (!secret || !sessionId) {
    return NextResponse.json({ paid: false }, { status: 400 });
  }

  const stripe = new Stripe(secret);
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.payment_status !== "paid") {
    return NextResponse.json({ paid: false });
  }

  return NextResponse.json({
    paid: true,
    ticket: session.metadata?.ticket ?? null,
  });
}
