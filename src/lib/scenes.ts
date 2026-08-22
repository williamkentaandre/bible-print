export type FrameFinish = "oak" | "gold";

export type LifestyleScene = {
  id: string;
  src: string;
  label: string;
  top: string;
  left: string;
  height: string;
};

export const LIFESTYLE_SCENES: LifestyleScene[] = [
  {
    id: "salon",
    src: "/scenes/scene-salon.png",
    label: "Salon",
    top: "16%",
    left: "50%",
    height: "44%",
  },
  {
    id: "chambre",
    src: "/scenes/scene-chambre.png",
    label: "Chambre",
    top: "10%",
    left: "50%",
    height: "38%",
  },
  {
    id: "couloir",
    src: "/scenes/scene-couloir.png",
    label: "Entrée",
    top: "14%",
    left: "48%",
    height: "46%",
  },
  {
    id: "salle",
    src: "/scenes/scene-salle.png",
    label: "Salle à manger",
    top: "12%",
    left: "52%",
    height: "40%",
  },
];
