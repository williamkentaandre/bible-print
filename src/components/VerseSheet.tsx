"use client";

import { breakVerseLines, pickComposition, quoteLines } from "@/lib/composition";
import {
  referenceFontSize,
  verseFontSize,
  type PrintSize,
} from "@/lib/sizes";
import { useFitText } from "@/lib/use-fit-text";
import type { VerseRef } from "@/lib/types";
import type { CSSProperties } from "react";

type VerseSheetProps = {
  text: string;
  reference: string;
  verseRef: VerseRef;
  size: PrintSize;
};

export function VerseSheet({ text, reference, verseRef, size }: VerseSheetProps) {
  const composition = pickComposition(verseRef, text, 1, size.orientation);
  const lines = quoteLines(breakVerseLines(text, size.orientation));
  const fontSize = verseFontSize(lines, size);
  const verseEl = useFitText(lines.join("\n"), Math.max(36, fontSize * 0.85), Math.max(fontSize * 2.6, 280));

  return (
    <article
      className="sheet"
      data-script={composition.script}
      data-palette={composition.palette}
      data-orientation={size.orientation}
      aria-label={`Verset ${reference}`}
      style={
        {
          "--sheet-width": `${size.widthIn}in`,
          "--sheet-height": `${size.heightIn}in`,
          "--ref-size": `${referenceFontSize(size)}px`,
        } as CSSProperties
      }
    >
      <div className="sheet-frame">
        <div className="sheet-frame-inner">
          <div className="verse-stage">
            <div ref={verseEl} className="verse-text" style={{ fontSize: `${fontSize}px` }}>
              {lines.map((line, index) => (
                <div key={`${index}-${line}`} className="verse-line">
                  {line}
                </div>
              ))}
            </div>
          </div>
          <footer className="sheet-footer">
            <p className="verse-ref">{reference}</p>
          </footer>
        </div>
      </div>
    </article>
  );
}
