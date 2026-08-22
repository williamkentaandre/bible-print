"use client";

import { hangStyle, LIFESTYLE_SCENES, sceneStyle, type FrameFinish } from "@/lib/scenes";
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
};

export function LifestyleCarousel({
  text,
  reference,
  verseRef,
  verticalSize,
  horizontalSize,
  finish,
}: LifestyleCarouselProps) {
  const slides = [...LIFESTYLE_SCENES, ...LIFESTYLE_SCENES];

  return (
    <div className="app-chrome lifestyle-carousel" aria-label="Aperçus du verset dans un intérieur">
      <div className="lifestyle-track">
        {slides.map((scene, index) => {
          const size = scene.orientation === "horizontal" ? horizontalSize : verticalSize;
          return (
            <figure key={`${scene.id}-${index}`} className="lifestyle-slide">
              <div className="lifestyle-scene" style={sceneStyle(scene)}>
                <div className="lifestyle-hang" data-scene={scene.id} style={hangStyle(scene, size)}>
                  <div className="lifestyle-art" data-finish={finish} data-orientation={size.orientation}>
                    <ScaledSheet
                      text={text}
                      reference={reference}
                      verseRef={verseRef}
                      size={size}
                    />
                  </div>
                </div>
              </div>
              <figcaption className="lifestyle-label">{scene.label}</figcaption>
            </figure>
          );
        })}
      </div>
    </div>
  );
}
