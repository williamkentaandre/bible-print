import type { Orientation } from "./sizes";
import type { VerseRef } from "./types";

export type ScriptId = "vibes" | "allura" | "alex" | "pinyon";
export type PaletteId = "blanc" | "ivoire" | "creme";

export type Composition = {
  script: ScriptId;
  palette: PaletteId;
  minSize: number;
  maxSize: number;
};

const SCRIPTS: ScriptId[] = ["vibes", "allura", "alex", "pinyon"];
const PALETTES: PaletteId[] = ["blanc", "ivoire", "creme"];

function hashRef(ref: VerseRef, length: number): number {
  const seed =
    ((ref.book + 3) * 73856093) ^
    ((ref.chapter + 1) * 19349663) ^
    (ref.verse * 83492791) ^
    (length * 39916801);
  return Math.abs(seed);
}

export function pickComposition(
  ref: VerseRef,
  text: string,
  scale = 1,
  orientation: Orientation = "vertical",
): Composition {
  const length = text.trim().length;
  const hash = hashRef(ref, length);
  const sizes: [number, number] =
    length < 55 ? [56, 152] : length < 110 ? [42, 128] : length < 200 ? [34, 108] : [24, 78];
  const boost = orientation === "horizontal" ? 1.15 : 1;

  return {
    script: SCRIPTS[hash % SCRIPTS.length],
    palette: PALETTES[(hash >>> 3) % PALETTES.length],
    minSize: Math.round(sizes[0] * scale),
    maxSize: Math.round(sizes[1] * scale * boost),
  };
}

function chars(words: string[]): number {
  return words.join(" ").length;
}

function evenWordGroups(words: string[], lineCount: number): string[][] {
  const total = words.length;
  const lines = Math.max(1, Math.min(lineCount, Math.max(1, Math.floor(total / 2))));
  const groups: string[][] = [];
  let index = 0;
  for (let remaining = lines; remaining > 0; remaining -= 1) {
    const take =
      remaining === 1 ? total - index : Math.max(2, Math.round((total - index) / remaining));
    groups.push(words.slice(index, index + take));
    index += take;
  }
  return groups;
}

function balancedWordGroups(words: string[], lineCount: number): string[][] {
  const total = words.length;
  const lines = Math.max(1, Math.min(lineCount, Math.max(1, Math.floor(total / 2))));
  if (lines <= 1) return [words];

  const ideal = chars(words) / lines;
  const infinity = 1e15;
  const cost = Array.from({ length: lines + 1 }, () => Array(total + 1).fill(infinity));
  const previous = Array.from({ length: lines + 1 }, () => Array(total + 1).fill(-1));
  cost[0][0] = 0;

  for (let line = 1; line <= lines; line += 1) {
    for (let end = line; end <= total; end += 1) {
      for (let start = line - 1; start < end; start += 1) {
        const count = end - start;
        const leftLines = lines - line;
        const leftWords = total - end;
        if (leftLines > 0 && leftWords < leftLines * 2) continue;
        if (line < lines && count < 2 && total >= lines * 2) continue;

        const length = chars(words.slice(start, end));
        let penalty = (length - ideal) ** 2;
        if (count === 1) penalty += 80_000;
        if (length < ideal * 0.5) penalty += 12_000;
        if (length > ideal * 1.6) penalty += 6_000;

        const totalCost = cost[line - 1][start] + penalty;
        if (totalCost < cost[line][end]) {
          cost[line][end] = totalCost;
          previous[line][end] = start;
        }
      }
    }
  }

  if (previous[lines][total] < 0) return evenWordGroups(words, lines);

  const groups: string[][] = [];
  let end = total;
  for (let line = lines; line >= 1; line -= 1) {
    const start = previous[line][end];
    groups.unshift(words.slice(start, end));
    end = start;
  }
  return groups;
}

function mergeIsolatedWords(groups: string[][]): string[][] {
  const next = groups.map((group) => [...group]);
  let changed = true;
  while (changed) {
    changed = false;
    for (let index = 0; index < next.length; index += 1) {
      if (next[index].length > 1 || next.length === 1) continue;
      if (index > 0) {
        next[index - 1].push(...next[index]);
        next.splice(index, 1);
      } else {
        next[1].unshift(...next[0]);
        next.splice(0, 1);
      }
      changed = true;
      break;
    }
  }
  return next;
}

function evenOutShortLines(groups: string[][]): string[][] {
  const next = groups.map((group) => [...group]);
  const longest = Math.max(...next.map(chars), 1);

  for (let index = 0; index < next.length; index += 1) {
    if (chars(next[index]) >= longest * 0.62) continue;
    const previous = next[index - 1];
    const following = next[index + 1];
    if (following && following.length > 2) {
      next[index].push(following.shift() as string);
    } else if (previous && previous.length > 2) {
      next[index].unshift(previous.pop() as string);
    }
  }

  return mergeIsolatedWords(next);
}

export function breakVerseLines(
  text: string,
  orientation: Orientation = "vertical",
): string[] {
  const words = text.replace(/\s+/g, " ").trim().split(" ");
  if (words.length <= 1) return [text.trim()];

  const length = chars(words);
  const landscape = orientation === "horizontal";
  const charsPerLine = landscape
    ? length < 50
      ? 16
      : length < 90
        ? 20
        : length < 160
          ? 24
          : length < 260
            ? 28
            : 32
    : length < 50
      ? 11
      : length < 90
        ? 13
        : length < 150
          ? 16
          : length < 260
            ? 19
            : 22;
  const minLines = 3;
  const maxLines = landscape ? 5 : 6;
  const targetLines = Math.max(
    minLines,
    Math.min(maxLines, Math.ceil(length / charsPerLine), Math.floor(words.length / 2)),
  );

  return evenOutShortLines(balancedWordGroups(words, targetLines)).map((group) =>
    group.join(" "),
  );
}

export function quoteLines(lines: string[]): string[] {
  if (lines.length === 0) return lines;
  if (lines.length === 1) return [`« ${lines[0]} »`];
  const quoted = [...lines];
  quoted[0] = `« ${quoted[0]}`;
  quoted[quoted.length - 1] = `${quoted[quoted.length - 1]} »`;
  return quoted;
}
