"use client";

import type { CSSProperties } from "react";
import type { Locale } from "@/i18n";
import type { BackgroundId } from "@/lib/backgrounds";
import type { FrameFinish } from "@/lib/scenes";
import type { PrintSize } from "@/lib/sizes";
import type { VerseRef } from "@/lib/types";
import { ScaledSheet } from "./ScaledSheet";

type CloseupTableauProps = {
  text: string;
  reference: string;
  verseRef: VerseRef;
  size: PrintSize;
  finish: FrameFinish;
  label: string;
  palette: BackgroundId;
  locale?: Locale;
};

export function CloseupTableau({
  text,
  reference,
  verseRef,
  size,
  finish,
  label,
  palette,
  locale,
}: CloseupTableauProps) {
  return (
    <div
      className="closeup"
      data-orientation={size.orientation}
      style={{ "--preview-ratio": `${size.widthIn} / ${size.heightIn}` } as CSSProperties}
    >
      <p className="closeup-label">{label}</p>
      <div className="room">
        <div className="picture-frame" data-finish={finish}>
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
  );
}
