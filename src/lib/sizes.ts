export type Orientation = "vertical" | "horizontal";

export type PrintSize = {
  id: string;
  widthIn: number;
  heightIn: number;
  inchesLabel: string;
  metricLabel: string;
  orientation: Orientation;
};

const BASE_SIZES = [
  { widthIn: 8.3, heightIn: 11.7, metricLabel: "A4" },
  { widthIn: 11, heightIn: 14, metricLabel: "27,94 × 35,56 cm" },
  { widthIn: 11.7, heightIn: 16.5, metricLabel: "A3" },
  { widthIn: 12, heightIn: 16, metricLabel: "30,48 × 40,64 cm" },
  { widthIn: 16, heightIn: 20, metricLabel: "40,64 × 50,80 cm" },
  { widthIn: 20, heightIn: 28, metricLabel: "50,80 × 71,12 cm" },
] as const;

function inchesLabel(width: number, height: number): string {
  return `${width}" × ${height}"`;
}

function makeSize(
  widthIn: number,
  heightIn: number,
  metricLabel: string,
  orientation: Orientation,
): PrintSize {
  return {
    id: `${widthIn}x${heightIn}-${orientation}`,
    widthIn,
    heightIn,
    inchesLabel: inchesLabel(widthIn, heightIn),
    metricLabel,
    orientation,
  };
}

export const PRINT_SIZES: PrintSize[] = BASE_SIZES.flatMap((size) => [
  makeSize(size.widthIn, size.heightIn, size.metricLabel, "vertical"),
  makeSize(size.heightIn, size.widthIn, size.metricLabel, "horizontal"),
]);

export const DEFAULT_SIZE_ID = "8.3x11.7-vertical";

export function getPrintSize(id: string): PrintSize {
  return PRINT_SIZES.find((size) => size.id === id) ?? PRINT_SIZES[0];
}

export function formatSizeLabel(size: PrintSize): string {
  const direction = size.orientation === "vertical" ? "Vertical" : "Horizontal";
  return `${size.inchesLabel} — ${size.metricLabel} (${direction})`;
}

const PX_PER_MM = 96 / 25.4;

export function innerVerseBox(size: PrintSize): { width: number; height: number } {
  const landscape = size.orientation === "horizontal";
  const padXmm = landscape ? 22 : 20;
  const padYmm = landscape ? 28 : 34;
  return {
    width: Math.max(120, size.widthIn * 96 - padXmm * 2 * PX_PER_MM),
    height: Math.max(120, size.heightIn * 96 - padYmm * PX_PER_MM),
  };
}

export function verseFontSize(lines: string[], size: PrintSize): number {
  const box = innerVerseBox(size);
  const longest = Math.max(1, ...lines.map((line) => line.length));
  const byWidth = box.width / (longest * 0.36);
  const byHeight = box.height / (Math.max(lines.length, 1) * 1.28);
  return Math.max(32, Math.min(byWidth, byHeight));
}

export function referenceFontSize(size: PrintSize): number {
  return Math.max(14, Math.min(42, size.heightIn * 1.4));
}
