import type { CSSProperties } from "react";
import type { PrintSize } from "./sizes";

export type FrameFinish = "oak" | "gold";

export type LifestyleScene = {
  id: string;
  src: string;
  label: string;
  left: string;
  /** Distance from the bottom of the photo to the furniture line; the frame hangs above it. */
  bottom: string;
  /** Visible width of the photo, in cm, used to scale the print. */
  roomWidthCm: number;
};

export const LIFESTYLE_SCENES: LifestyleScene[] = [
  {
    id: "salon",
    src: "/scenes/scene-salon.png",
    label: "Salon",
    left: "50%",
    bottom: "52%",
    roomWidthCm: 330,
  },
  {
    id: "chambre",
    src: "/scenes/scene-chambre.png",
    label: "Chambre",
    left: "50%",
    bottom: "50%",
    roomWidthCm: 250,
  },
  {
    id: "couloir",
    src: "/scenes/scene-couloir.png",
    label: "Entrée",
    left: "58%",
    bottom: "47%",
    roomWidthCm: 300,
  },
  {
    id: "salle",
    src: "/scenes/scene-salle.png",
    label: "Salle à manger",
    left: "70%",
    bottom: "40%",
    roomWidthCm: 340,
  },
];

export function hangStyle(scene: LifestyleScene, size: PrintSize): CSSProperties {
  const widthPct = (size.widthIn * 2.54) / scene.roomWidthCm * 100;
  return {
    left: scene.left,
    bottom: scene.bottom,
    width: `${widthPct}%`,
    aspectRatio: `${size.widthIn} / ${size.heightIn}`,
  };
}
