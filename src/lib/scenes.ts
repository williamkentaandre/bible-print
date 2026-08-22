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
  /** Wall plane vs camera, in degrees. */
  rotateY: number;
  rotateX: number;
  skewY: number;
};

export const LIFESTYLE_SCENES: LifestyleScene[] = [
  {
    id: "salon",
    src: "/scenes/scene-salon.png",
    label: "Salon",
    left: "50%",
    bottom: "53%",
    roomWidthCm: 330,
    rotateY: 0,
    rotateX: 3,
    skewY: 0,
  },
  {
    id: "chambre",
    src: "/scenes/scene-chambre.png",
    label: "Chambre",
    left: "51%",
    bottom: "51%",
    roomWidthCm: 250,
    rotateY: 2,
    rotateX: 2,
    skewY: -0.4,
  },
  {
    id: "couloir",
    src: "/scenes/scene-couloir.png",
    label: "Entrée",
    left: "61%",
    bottom: "46%",
    roomWidthCm: 300,
    rotateY: 14,
    rotateX: 2,
    skewY: 0.6,
  },
  {
    id: "salle",
    src: "/scenes/scene-salle.png",
    label: "Salle à manger",
    left: "72%",
    bottom: "38%",
    roomWidthCm: 340,
    rotateY: -8,
    rotateX: 1.5,
    skewY: 0.3,
  },
];

export function hangStyle(scene: LifestyleScene, size: PrintSize): CSSProperties {
  const widthPct = (size.widthIn * 2.54) / scene.roomWidthCm * 100;
  const heightPct = widthPct * (size.heightIn / size.widthIn);
  return {
    left: scene.left,
    bottom: scene.bottom,
    width: `${widthPct}%`,
    height: 0,
    paddingBottom: `${heightPct}%`,
    "--wall-y": `${scene.rotateY}deg`,
    "--wall-x": `${scene.rotateX}deg`,
    "--wall-skew": `${scene.skewY}deg`,
  } as CSSProperties;
}
