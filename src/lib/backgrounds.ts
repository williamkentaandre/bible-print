export type BackgroundId =
  | "blanc"
  | "ivoire"
  | "creme"
  | "parchemin"
  | "lin"
  | "champagne"
  | "sauge"
  | "encre";

export type BackgroundGroup = "classique" | "original";

export type PaperBackground = {
  id: BackgroundId;
  label: string;
  group: BackgroundGroup;
  capture: string;
};

export const DEFAULT_BACKGROUND: BackgroundId = "ivoire";

export const PAPER_BACKGROUNDS: PaperBackground[] = [
  { id: "blanc", label: "Galerie", group: "classique", capture: "#ffffff" },
  { id: "ivoire", label: "Ivoire", group: "classique", capture: "#fffcf6" },
  { id: "creme", label: "Crème", group: "classique", capture: "#fffaf0" },
  { id: "parchemin", label: "Parchemin", group: "classique", capture: "#f0dfb8" },
  { id: "lin", label: "Lin", group: "original", capture: "#efe4cf" },
  { id: "champagne", label: "Champagne", group: "original", capture: "#f3e2b4" },
  { id: "sauge", label: "Sauge", group: "original", capture: "#dfe4d6" },
  { id: "encre", label: "Encre", group: "original", capture: "#1a1814" },
];

const BACKGROUND_IDS = new Set<string>(PAPER_BACKGROUNDS.map((item) => item.id));

export function isBackgroundId(value: string | undefined): value is BackgroundId {
  return Boolean(value && BACKGROUND_IDS.has(value));
}

export function getBackground(id: string | undefined): PaperBackground {
  return PAPER_BACKGROUNDS.find((item) => item.id === id) ?? PAPER_BACKGROUNDS[1];
}

export function backgroundsIn(group: BackgroundGroup): PaperBackground[] {
  return PAPER_BACKGROUNDS.filter((item) => item.group === group);
}
