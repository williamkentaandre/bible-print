import type { VerseChoice } from "./types";
import { PRINT_FORMAT_COUNT } from "./sizes";

export const PRINT_PRICE_CENTS = 500;
export const PRINT_PRICE_LABEL = "5 €";
export const PRINT_OFFER_LABEL = `${PRINT_FORMAT_COUNT} PDF, toutes tailles`;
export const PRINT_FULFILLMENT_LABEL =
  `${PRINT_FORMAT_COUNT} PDF, toutes tailles. Vous faites tirer le format choisi chez un imprimeur, le cadre se trouve ensuite.`;
export const PAYWALL_ENABLED = false;

export function printTicket(choice: VerseChoice): string {
  return `${choice.book}:${choice.chapter}:${choice.verse}:${choice.sentence}`;
}

export function isPrintTicket(value: string): boolean {
  return /^\d+:\d+:\d+:\d+(?::[\w.-]+)?$/.test(value);
}

export function ticketUnlocks(paidTicket: string, choice: VerseChoice): boolean {
  const key = printTicket(choice);
  return paidTicket === key || paidTicket.startsWith(`${key}:`);
}
