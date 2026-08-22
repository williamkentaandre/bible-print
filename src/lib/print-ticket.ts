import type { VerseChoice } from "./types";

export const PRINT_PRICE_CENTS = 500;
export const PRINT_PRICE_LABEL = "5 €";

export function printTicket(choice: VerseChoice, sizeId: string): string {
  return `${choice.book}:${choice.chapter}:${choice.verse}:${choice.sentence}:${sizeId}`;
}

export function isPrintTicket(value: string): boolean {
  return /^\d+:\d+:\d+:\d+:[\w.-]+$/.test(value);
}
