import { NextRequest, NextResponse } from "next/server";
import { sendLoginEmail, sendReadyEmail } from "@/lib/mail";
import { createCheckout, hasPaidTicket, listPaidOrders } from "@/lib/orders";
import { isPrintTicket } from "@/lib/print-ticket";
import { addPreviewOrder, isEmail, normalizeEmail, setSessionEmail } from "@/lib/session";
import { isStripeConfigured } from "@/lib/stripe-client";

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
    if (isStripeConfigured() && orders.length === 0) {
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
        : "Email non configuré. Vérifiez RESEND_API_KEY, ou ouvrez Mes impressions sur ce navigateur.",
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

  if (!isStripeConfigured()) {
    await addPreviewOrder(email, {
      id: `preview-${ticket}`,
      ticket,
      reference,
      created: Math.floor(Date.now() / 1000),
    });
    await setSessionEmail(email);
    let sent = false;
    try {
      sent = await sendReadyEmail(email, origin, reference);
    } catch {
      sent = false;
    }
    return NextResponse.json({
      preview: true,
      sent,
      redirect: "/mes-impressions",
      message: sent
        ? "Essai sans paiement : un email vient de partir. Vos PDF sont aussi dans Mes impressions."
        : "Essai sans paiement : vos PDF sont dans Mes impressions. (L’email n’est pas encore parti : vérifiez RESEND_API_KEY.)",
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
