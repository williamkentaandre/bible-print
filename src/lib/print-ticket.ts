import { isBackgroundId, type BackgroundId } from "./backgrounds";
import type { VerseChoice } from "./types";
import { PRINT_FORMAT_COUNT } from "./sizes";

export const PRINT_PRICE_CENTS = 500;
export const PRINT_PRICE_LABEL = "5 €";
export const PRINT_OFFER_LABEL = `${PRINT_FORMAT_COUNT} PDF, toutes tailles`;
export const PRINT_FULFILLMENT_LABEL =
  `${PRINT_FORMAT_COUNT} PDF, toutes tailles. Vous faites tirer le format choisi chez un imprimeur, le cadre se trouve ensuite.`;
export const CONTACT_EMAIL = "contact@bibledeco.com";
export const PAYWALL_ENABLED = true;

export function verseTicket(choice: VerseChoice): string {
  return `${choice.book}:${choice.chapter}:${choice.verse}:${choice.sentence}`;
}

export function printTicket(choice: VerseChoice, palette?: BackgroundId): string {
  const key = verseTicket(choice);
  return palette ? `${key}:${palette}` : key;
}

export function parseTicket(value: string): VerseChoice | null {
  if (!isPrintTicket(value)) return null;
  const [book, chapter, verse, sentence] = value.split(":").map(Number);
  if ([book, chapter, verse, sentence].some((part) => !Number.isFinite(part))) {
    return null;
  }
  return { book, chapter, verse, sentence };
}

export function parseTicketPalette(value: string): BackgroundId | undefined {
  const id = value.split(":")[4];
  return isBackgroundId(id) ? id : undefined;
}

export function isPrintTicket(value: string): boolean {
  return /^\d+:\d+:\d+:\d+(?::[\w.-]+)?$/.test(value);
}

export function ticketUnlocks(paidTicket: string, choice: VerseChoice): boolean {
  const key = verseTicket(choice);
  return paidTicket === key || paidTicket.startsWith(`${key}:`);
}
