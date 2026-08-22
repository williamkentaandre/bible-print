export type Book = {
  name: string;
  testament: "AT" | "NT";
  aliases: string[];
  chapters: string[][];
};

export type Bible = {
  translation: string;
  copyright: string;
  books: Book[];
};

export type VerseRef = {
  book: number;
  chapter: number;
  verse: number;
};

/** `sentence` is 0 for the whole verse, or 1-based for a single sentence. */
export type VerseChoice = VerseRef & {
  sentence: number;
};
