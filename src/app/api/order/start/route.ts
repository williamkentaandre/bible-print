import { NextRequest, NextResponse } from "next/server";
import { sendLoginEmail } from "@/lib/mail";
import { createCheckout, hasPaidTicket, listPaidOrders } from "@/lib/orders";
import { isPrintTicket } from "@/lib/print-ticket";
import { isEmail, normalizeEmail } from "@/lib/session";

export async function POST(request: NextRequest) {
  let body: { email?: string; ticket?: string; reference?: string; intent?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const email = normalizeEmail(body.email ?? "");
  if (!isEmail(email)) {
    return NextResponse.json({ error: "Indiquez un email valide." }, { status: 400 });
  }

  const origin = request.headers.get("origin") || request.nextUrl.origin;
  const intent = body.intent === "login" ? "login" : "buy";

  if (intent === "login") {
    const orders = await listPaidOrders(email);
    if (orders.length === 0) {
      return NextResponse.json(
        { error: "Aucune impression à ce nom. Commencez par commander un verset." },
        { status: 404 },
      );
    }
    const sent = await sendLoginEmail(email, origin);
    return NextResponse.json({
      sent,
      message: sent
        ? "Un lien a été envoyé. Ouvrez votre boîte mail."
        : "Email non configuré. Ajoutez RESEND_API_KEY, ou payez depuis cette page pour ouvrir votre espace.",
    });
  }

  const ticket = body.ticket?.trim() ?? "";
  const reference = body.reference?.trim() || "Verset";
  if (!isPrintTicket(ticket)) {
    return NextResponse.json({ error: "Sélection invalide." }, { status: 400 });
  }

  if (await hasPaidTicket(email, ticket)) {
    const sent = await sendLoginEmail(email, origin);
    return NextResponse.json({
      alreadyPaid: true,
      sent,
      message: sent
        ? "Ce verset est déjà à vous. Un lien a été envoyé."
        : "Ce verset est déjà à vous. Ouvrez Mes impressions.",
    });
  }

  try {
    const url = await createCheckout({ email, ticket, reference, origin });
    return NextResponse.json({ url });
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : "Paiement impossible.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
