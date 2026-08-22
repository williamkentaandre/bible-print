"use client";

import type { CSSProperties } from "react";
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
};

export function CloseupTableau({
  text,
  reference,
  verseRef,
  size,
  finish,
}: CloseupTableauProps) {
  return (
    <div
      className="closeup"
      style={{ "--preview-ratio": `${size.widthIn} / ${size.heightIn}` } as CSSProperties}
    >
      <div className="room">
        <div className="picture-frame" data-finish={finish}>
          <ScaledSheet
            text={text}
            reference={reference}
            verseRef={verseRef}
            size={size}
          />
        </div>
      </div>
    </div>
  );
}
