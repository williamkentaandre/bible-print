"use client";

import type { CSSProperties } from "react";
import type { BackgroundId } from "@/lib/backgrounds";
import { pickComposition } from "@/lib/composition";
import { useFittedVerseLines } from "@/lib/use-fitted-verse-lines";
import type { VerseRef } from "@/lib/types";

export const PIN_W = 1000;
export const PIN_H = 1500;
export const PIN_CREDIT_H = 72;

type StudioExportSheetProps = {
  text: string;
  verseRef: VerseRef;
  palette: BackgroundId;
  width?: number;
  height?: number;
};

export function StudioExportSheet({
  text,
  verseRef,
  palette,
  width,
  height,
}: StudioExportSheetProps) {
  const landscape = width != null && height != null ? width > height : false;
  const orientation = landscape ? "horizontal" : "vertical";
  const composition = pickComposition(verseRef, text, 1, orientation);
  const max = Math.round((height ?? 900) * 0.16);
  const { lines, verseEl } = useFittedVerseLines(text, orientation, "fr", 14, Math.max(48, max), {
    bottomPad: 0.55,
  });

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
