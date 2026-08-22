import type { Locale } from "@/i18n";
import { clampSentence, getPrintedText as pickSentence } from "./sentences";
import type { Bible, Book, VerseChoice, VerseRef } from "./types";

export const DEFAULT_REF: VerseRef = { book: 5, chapter: 24, verse: 15 };
export const DEFAULT_CHOICE: VerseChoice = { ...DEFAULT_REF, sentence: 2 };

export async function loadBible(locale: Locale = "fr"): Promise<Bible> {
  const file = locale === "en" ? "/data/kjv.json" : "/data/lsg.json";
  const response = await fetch(file);
  if (!response.ok) {
    throw new Error(
      locale === "en"
        ? "Could not load the Bible text."
        : "Impossible de charger le texte biblique.",
    );
  }
  return response.json();
}

function fold(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

export function findBookIndex(query: string, books: Book[]): number {
  const needle = fold(query);
  if (!needle) return -1;

  const exact = books.findIndex((book) =>
    [book.name, ...book.aliases].some((name) => fold(name) === needle),
  );
  if (exact >= 0) return exact;

  const prefixHits = books.flatMap((book, index) => {
    const names = [book.name, ...book.aliases].map(fold);
    return names.some((name) => name.startsWith(needle) && needle.length >= 2)
      ? [index]
      : [];
  });
  return prefixHits.length === 1 ? prefixHits[0] : -1;
}

export function parseReference(input: string, books: Book[]): VerseRef | null {
  const normalized = input
    .trim()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[_–—]/g, " ")
    .replace(/[,;]/g, " ")
    .replace(/\s+/g, " ");

  const match = normalized.match(
    /^((?:[123]\s*)?[A-Za-z]+(?:\s+[A-Za-z]+)*)\s+(\d+)(?:\s*[.:v]\s*(\d+))?$/i,
  );
  if (!match) return null;

  const book = findBookIndex(match[1], books);
  if (book < 0) return null;

  const chapter = Number(match[2]);
  const verse = match[3] ? Number(match[3]) : 1;
  if (!isValidRef(books, { book, chapter, verse })) return null;
  return { book, chapter, verse };
}

export function isValidRef(books: Book[], ref: VerseRef): boolean {
  const book = books[ref.book];
  if (!book) return false;
  const chapter = book.chapters[ref.chapter - 1];
  if (!chapter) return false;
  return ref.verse >= 1 && ref.verse <= chapter.length && Boolean(chapter[ref.verse - 1]);
}

export function clampRef(books: Book[], ref: VerseRef): VerseRef {
  const book = Math.min(Math.max(ref.book, 0), books.length - 1);
  const chapters = books[book].chapters;
  const chapter = Math.min(Math.max(ref.chapter, 1), chapters.length);
  const verses = chapters[chapter - 1];
  const verse = Math.min(Math.max(ref.verse, 1), verses.length);
  return { book, chapter, verse };
}

export function clampChoice(books: Book[], choice: VerseChoice): VerseChoice {
  const ref = clampRef(books, choice);
  const sameVerse =
    ref.book === choice.book && ref.chapter === choice.chapter && ref.verse === choice.verse;
  return {
    ...ref,
    sentence: sameVerse ? clampSentence(getVerseText(books, ref), choice.sentence) : 0,
  };
}

export function getVerseText(books: Book[], ref: VerseRef): string {
  return books[ref.book]?.chapters[ref.chapter - 1]?.[ref.verse - 1] ?? "";
}

export function getChoiceText(books: Book[], choice: VerseChoice): string {
  return pickSentence(getVerseText(books, choice), choice.sentence);
}

export function formatReference(books: Book[], ref: VerseRef): string {
  const name = books[ref.book]?.name ?? "";
  return `${name} ${ref.chapter}:${ref.verse}`;
}
