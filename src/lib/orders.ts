import { getCopy, parseLocale, type Locale } from "@/i18n";
import type Stripe from "stripe";
import type { OrderRecord } from "./order-types";
import { isPrintTicket, parseTicket, PRINT_PRICE_CENTS, ticketUnlocks } from "./print-ticket";
import { getStripe, isStripeConfigured } from "./stripe-client";
import { getPreviewOrders, normalizeEmail } from "./session";

export type { OrderRecord };

export async function findOrCreateCustomer(email: string) {
  const stripe = getStripe();
  if (!stripe) return null;
  const normalized = normalizeEmail(email);
  const existing = await stripe.customers.list({ email: normalized, limit: 1 });
  if (existing.data[0]) return existing.data[0];
  return stripe.customers.create({ email: normalized });
}

function orderFromSession(session: Stripe.Checkout.Session): OrderRecord | null {
  if (session.payment_status !== "paid") return null;
  const ticket = session.metadata?.ticket?.trim() ?? "";
  if (!isPrintTicket(ticket)) return null;
  return {
    id: session.id,
    ticket,
    reference: session.metadata?.reference?.trim() || "Verset",
    created: session.created,
  };
}

export async function listPaidOrders(email: string): Promise<OrderRecord[]> {
  if (!isStripeConfigured()) {
    return getPreviewOrders(email);
  }
  const stripe = getStripe();
  if (!stripe) return [];
  const customers = await stripe.customers.list({
    email: normalizeEmail(email),
    limit: 1,
  });
  const customer = customers.data[0];
  if (!customer) return [];

  const sessions = await stripe.checkout.sessions.list({
    customer: customer.id,
    limit: 100,
  });
  const seen = new Set<string>();
  const orders: OrderRecord[] = [];
  for (const session of sessions.data) {
    const order = orderFromSession(session);
    if (!order || seen.has(order.ticket)) continue;
    seen.add(order.ticket);
    orders.push(order);
  }
  return orders.sort((a, b) => b.created - a.created);
}

export async function hasPaidTicket(email: string, ticket: string) {
  const choice = parseTicket(ticket);
  if (!choice) return false;
  const orders = await listPaidOrders(email);
  return orders.some((order) => ticketUnlocks(order.ticket, choice));
}

export async function createCheckout(options: {
  email: string;
  ticket: string;
  reference: string;
  origin: string;
  locale?: Locale;
}) {
  const stripe = getStripe();
  if (!stripe) {
    throw new Error("Paiement non configuré. Ajoutez STRIPE_SECRET_KEY.");
  }
  const customer = await findOrCreateCustomer(options.email);
  if (!customer) {
    throw new Error("Paiement non configuré.");
  }

  const locale = parseLocale(options.locale);
  const copy = getCopy(locale);
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    locale: locale === "en" ? "en" : "fr",
    currency: "eur",
    customer: customer.id,
    payment_method_types: ["card"],
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "eur",
          unit_amount: PRINT_PRICE_CENTS,
          product_data: {
            name: "Bible Deco - 12 PDF",
            description: `${options.reference}. ${copy.offer}.`,
          },
        },
      },
    ],
    metadata: {
      ticket: options.ticket,
      reference: options.reference,
      email: normalizeEmail(options.email),
      locale,
    },
    success_url: `${options.origin}${copy.paths.prints}?checkout={CHECKOUT_SESSION_ID}`,
    cancel_url: `${options.origin}${copy.paths.home}?cancel=1`,
  });

  if (!session.url) {
    throw new Error("Impossible d’ouvrir le paiement.");
  }
  return session.url;
}
