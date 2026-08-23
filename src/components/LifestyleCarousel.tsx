"use client";

import type { Locale } from "@/i18n";
import { getCopy } from "@/i18n";
import type { BackgroundId } from "@/lib/backgrounds";
import { hangStyle, LIFESTYLE_PAIR, sceneStyle, type FrameFinish } from "@/lib/scenes";
import type { PrintSize } from "@/lib/sizes";
import type { VerseRef } from "@/lib/types";
import { ScaledSheet } from "./ScaledSheet";

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
  const sceneLabel = (id: string, fallback: string) =>
    id === "salon" ? copy.sceneSalon : id === "chambre" ? copy.sceneChambre : fallback;

  return (
    <div className="lifestyle-pair" aria-label={copy.lifestyleLabel}>
      {LIFESTYLE_PAIR.map((scene) => {
        const size = scene.orientation === "horizontal" ? horizontalSize : verticalSize;
        return (
          <figure key={scene.id} className="lifestyle-slide">
            <div className="lifestyle-scene" style={sceneStyle(scene)}>
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
            <figcaption className="lifestyle-label">{sceneLabel(scene.id, scene.label)}</figcaption>
          </figure>
        );
      })}
    </div>
  );
}
