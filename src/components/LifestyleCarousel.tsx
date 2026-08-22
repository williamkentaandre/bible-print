"use client";

import { hangStyle, LIFESTYLE_SCENES, sceneStyle, type FrameFinish } from "@/lib/scenes";
import type { PrintSize } from "@/lib/sizes";
import type { VerseRef } from "@/lib/types";
import { ScaledSheet } from "./ScaledSheet";

type LifestyleCarouselProps = {
  text: string;
  reference: string;
  verseRef: VerseRef;
  size: PrintSize;
  finish: FrameFinish;
};

function LifestyleArt({
  text,
  reference,
  verseRef,
  size,
  finish,
}: LifestyleCarouselProps) {
  return (
    <div className="lifestyle-art" data-finish={finish} data-orientation={size.orientation}>
      <ScaledSheet
        text={text}
        reference={reference}
        verseRef={verseRef}
        size={size}
      />
    </div>
  );
}

export function LifestyleCarousel(props: LifestyleCarouselProps) {
  const slides = [...LIFESTYLE_SCENES, ...LIFESTYLE_SCENES];

  return (
    <div className="app-chrome lifestyle-carousel" aria-label="Aperçus du verset dans un intérieur">
      <div className="lifestyle-track">
        {slides.map((scene, index) => (
          <figure key={`${scene.id}-${index}`} className="lifestyle-slide">
            <div className="lifestyle-scene" style={sceneStyle(scene)}>
              <div className="lifestyle-hang" data-scene={scene.id} style={hangStyle(scene, props.size)}>
                <LifestyleArt {...props} />
              </div>
            </div>
            <figcaption className="lifestyle-label">{scene.label}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
