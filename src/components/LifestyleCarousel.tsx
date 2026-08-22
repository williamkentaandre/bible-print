"use client";

import { breakVerseLines, pickComposition, quoteLines } from "@/lib/composition";
import { hangStyle, LIFESTYLE_SCENES, type FrameFinish } from "@/lib/scenes";
import type { PrintSize } from "@/lib/sizes";
import type { VerseRef } from "@/lib/types";

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
  const composition = pickComposition(verseRef, text, 1, size.orientation);
  const lines = quoteLines(breakVerseLines(text, size.orientation));

  return (
    <div
      className="lifestyle-art"
      data-finish={finish}
      data-script={composition.script}
      data-orientation={size.orientation}
    >
      <div className="lifestyle-paper" data-palette={composition.palette}>
        <div className="lifestyle-rule">
            {lines.map((line, index) => (
              <p key={`${index}-${line}`} className="lifestyle-line">
                {line}
              </p>
            ))}
          <p className="lifestyle-ref">{reference}</p>
        </div>
      </div>
    </div>
  );
}

export function LifestyleCarousel(props: LifestyleCarouselProps) {
  const slides = [...LIFESTYLE_SCENES, ...LIFESTYLE_SCENES];

  return (
    <div className="app-chrome lifestyle-carousel" aria-label="Aperçus du verset dans un intérieur">
      <div className="lifestyle-track">
        {slides.map((scene, index) => (
          <figure
            key={`${scene.id}-${index}`}
            className="lifestyle-slide"
            style={{ backgroundImage: `url(${scene.src})` }}
          >
            <div className="lifestyle-hang" data-scene={scene.id} style={hangStyle(scene, props.size)}>
              <LifestyleArt {...props} />
            </div>
            <figcaption className="lifestyle-label">{scene.label}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
