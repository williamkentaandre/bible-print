"use client";

import { breakVerseLines, pickComposition, quoteLines } from "@/lib/composition";
import { hangStyle, LIFESTYLE_SCENES, sceneStyle, type FrameFinish } from "@/lib/scenes";
import type { PrintSize } from "@/lib/sizes";
import type { VerseRef } from "@/lib/types";
import { useFitText } from "@/lib/use-fit-text";

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
  const verseEl = useFitText(lines.join("\n"), 4, 64);

  return (
    <div
      className="lifestyle-art"
      data-finish={finish}
      data-script={composition.script}
      data-orientation={size.orientation}
    >
      <div className="lifestyle-paper" data-palette={composition.palette}>
        <div className="lifestyle-rule">
          <div className="verse-stage">
            <div ref={verseEl} className="verse-text">
              {lines.map((line, index) => (
                <div key={`${index}-${line}`} className="verse-line">
                  {line}
                </div>
              ))}
            </div>
          </div>
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
