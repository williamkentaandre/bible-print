"use client";

import { useState } from "react";
import type { Locale } from "@/i18n";
import { getCopy } from "@/i18n";
import type { BackgroundId } from "@/lib/backgrounds";
import { hangStyle, LIFESTYLE_PAIR, sceneStyle, type FrameFinish } from "@/lib/scenes";
import type { PrintSize } from "@/lib/sizes";
import type { VerseRef } from "@/lib/types";
import { ScaledSheet } from "./ScaledSheet";

const ZOOM_MIN = 0.5;
const ZOOM_MAX = 1.75;
const ZOOM_STEP = 0.15;

type LifestyleCarouselProps = {
  text: string;
  reference: string;
  verseRef: VerseRef;
  verticalSize: PrintSize;
  horizontalSize: PrintSize;
  finish: FrameFinish;
  palette: BackgroundId;
  locale?: Locale;
};

function clampZoom(value: number) {
  return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round(value * 100) / 100));
}

export function LifestyleCarousel({
  text,
  reference,
  verseRef,
  verticalSize,
  horizontalSize,
  finish,
  palette,
  locale = "fr",
}: LifestyleCarouselProps) {
  const copy = getCopy(locale);
  const [zoomByScene, setZoomByScene] = useState<Record<string, number>>({
    salon: 1,
    chambre: 1,
  });
  const sceneLabel = (id: string, fallback: string) =>
    id === "salon" ? copy.sceneSalon : id === "chambre" ? copy.sceneChambre : fallback;

  const nudgeZoom = (id: string, delta: number) => {
    setZoomByScene((current) => ({
      ...current,
      [id]: clampZoom((current[id] ?? 1) + delta),
    }));
  };

  return (
    <div className="lifestyle-pair" aria-label={copy.lifestyleLabel}>
      {LIFESTYLE_PAIR.map((scene) => {
        const size = scene.orientation === "horizontal" ? horizontalSize : verticalSize;
        const zoomFactor = zoomByScene[scene.id] ?? 1;
        const label = sceneLabel(scene.id, scene.label);
        return (
          <figure key={scene.id} className="lifestyle-slide">
            <div className="lifestyle-scene" style={sceneStyle(scene, zoomFactor)}>
              <div className="lifestyle-hang" data-scene={scene.id} style={hangStyle(scene, size)}>
                <div className="lifestyle-art" data-finish={finish} data-orientation={size.orientation}>
                  <ScaledSheet
                    text={text}
                    reference={reference}
                    verseRef={verseRef}
                    size={size}
                    palette={palette}
                    locale={locale}
                  />
                </div>
              </div>
            </div>
            <div className="lifestyle-zoom" role="group" aria-label={`${copy.zoomLabel} · ${label}`}>
              <button
                type="button"
                aria-label={`${copy.zoomOut} · ${label}`}
                disabled={zoomFactor <= ZOOM_MIN}
                onClick={() => nudgeZoom(scene.id, -ZOOM_STEP)}
              >
                −
              </button>
              <button
                type="button"
                aria-label={`${copy.zoomIn} · ${label}`}
                disabled={zoomFactor >= ZOOM_MAX}
                onClick={() => nudgeZoom(scene.id, ZOOM_STEP)}
              >
                +
              </button>
            </div>
            <figcaption className="lifestyle-label">{label}</figcaption>
          </figure>
        );
      })}
    </div>
  );
}
