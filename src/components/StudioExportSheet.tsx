"use client";

import type { CSSProperties } from "react";
import type { BackgroundId } from "@/lib/backgrounds";
import { breakVerseLines, pickComposition, quoteLines } from "@/lib/composition";
import { useFitText } from "@/lib/use-fit-text";
import type { VerseRef } from "@/lib/types";

export const PIN_W = 1000;
export const PIN_H = 1500;
export const PIN_CREDIT_H = 72;

type StudioExportSheetProps = {
  text: string;
  reference: string;
  verseRef: VerseRef;
  palette: BackgroundId;
  width?: number;
  height?: number;
};

export function StudioExportSheet({
  text,
  reference,
  verseRef,
  palette,
  width,
  height,
}: StudioExportSheetProps) {
  const landscape = width != null && height != null ? width > height : false;
  const composition = pickComposition(verseRef, text, 1, landscape ? "horizontal" : "vertical");
  const lines = quoteLines(breakVerseLines(text, landscape ? "horizontal" : "vertical"), "fr");
  const max = Math.round((height ?? 900) * 0.16);
  const verseEl = useFitText(lines.join("\n"), 22, Math.max(48, max));

  return (
    <article
      className="studio-export-sheet"
      data-script={composition.script}
      data-palette={palette}
      style={
        {
          width: width ?? "100%",
          height: height ?? "100%",
        } as CSSProperties
      }
    >
      <div className="studio-export-frame">
        <div className="studio-export-inner">
          <div className="studio-export-stage">
            <div ref={verseEl} className="verse-text">
              {lines.map((line, index) => (
                <div key={`${index}-${line}`} className="verse-line">
                  {line}
                </div>
              ))}
            </div>
          </div>
          <footer className="studio-export-footer">
            <p className="studio-export-ref">{reference}</p>
          </footer>
        </div>
      </div>
    </article>
  );
}

export function printExportSize(size: { widthIn: number; heightIn: number }) {
  const ratio = size.widthIn / size.heightIn;
  if (ratio >= 1) {
    return { width: 1400, height: Math.round(1400 / ratio) };
  }
  return { width: Math.round(1400 * ratio), height: 1400 };
}
