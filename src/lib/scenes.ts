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
  /** Wall plane vs camera. Applied as a 2D projection, not a parent 3D scene. */
  rotateY: number;
  rotateX: number;
  zoom: number;
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
    rotateX: 2.5,
    zoom: 2.25,
  },
  {
    id: "chambre",
    src: "/scenes/scene-chambre.png",
    label: "Chambre",
    left: "52%",
    bottom: "50%",
    roomWidthCm: 250,
    rotateY: -5,
    rotateX: 1.5,
    zoom: 2.2,
  },
  {
    id: "couloir",
    src: "/scenes/scene-couloir.png",
    label: "Entrée",
    left: "63%",
    bottom: "44%",
    roomWidthCm: 280,
    rotateY: 19,
    rotateX: 1.5,
    zoom: 2.05,
  },
  {
    id: "salle",
    src: "/scenes/scene-salle.png",
    label: "Salle à manger",
    left: "70%",
    bottom: "36%",
    roomWidthCm: 320,
    rotateY: -11,
    rotateX: 1.2,
    zoom: 2.15,
  },
];

export function sceneStyle(scene: LifestyleScene): CSSProperties {
  return {
    backgroundImage: `url(${scene.src})`,
    "--zoom-x": scene.left,
    "--zoom-y": `calc(100% - ${scene.bottom} - 7%)`,
    "--scene-zoom": String(scene.zoom),
  } as CSSProperties;
}

export function hangStyle(scene: LifestyleScene, size: PrintSize): CSSProperties {
  const widthPct = (size.widthIn * 2.54) / scene.roomWidthCm * 100;
  return {
    left: scene.left,
    bottom: scene.bottom,
    width: `${widthPct}%`,
    aspectRatio: `${size.widthIn} / ${size.heightIn}`,
    "--wall-y": `${scene.rotateY}deg`,
    "--wall-x": `${scene.rotateX}deg`,
  } as CSSProperties;
}
