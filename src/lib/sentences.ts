const HAS_WORD = /[\p{L}\p{N}]/u;

export function splitSentences(text: string): string[] {
  const source = text.replace(/\s+/g, " ").trim();
  if (!source) return [];

  const sentences: string[] = [];
  for (const part of source.split(/(?<=[.!?])\s+/)) {
    const piece = part.trim();
    if (!piece) continue;
    if (!HAS_WORD.test(piece)) {
      if (sentences.length > 0) {
        sentences[sentences.length - 1] += piece;
      }
      continue;
    }
    sentences.push(piece);
  }

  return sentences.length > 0 ? sentences : [source];
}

export function sentencePreview(text: string, max = 92): string {
  const compact = text.replace(/\s+/g, " ").trim();
  if (compact.length <= max) return compact;
  return `${compact.slice(0, max - 1).trimEnd()}…`;
}

export function getPrintedText(fullVerse: string, sentence: number): string {
  if (sentence <= 0) return fullVerse;
  return splitSentences(fullVerse)[sentence - 1] ?? fullVerse;
}

export function clampSentence(fullVerse: string, sentence: number): number {
  const count = splitSentences(fullVerse).length;
  if (count <= 1 || sentence <= 0) return 0;
  return Math.min(sentence, count);
}
