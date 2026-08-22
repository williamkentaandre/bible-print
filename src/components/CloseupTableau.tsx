"use client";

import { useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import type { FrameFinish } from "@/lib/scenes";
import type { PrintSize } from "@/lib/sizes";
import type { VerseRef } from "@/lib/types";
import { VerseSheet } from "./VerseSheet";

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
  const frameRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  useLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const apply = () => {
      const width = frame.clientWidth;
      const sheetPx = size.widthIn * 96;
      setScale(sheetPx > 0 ? width / sheetPx : 0);
    };

    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(frame);
    return () => observer.disconnect();
  }, [size.widthIn]);

  return (
    <div
      className="closeup"
      style={{ "--preview-ratio": `${size.widthIn} / ${size.heightIn}` } as CSSProperties}
    >
      <div className="room">
        <div className="picture-frame" data-finish={finish}>
          <div className="preview-frame" ref={frameRef}>
            <div
              className="sheet-scale"
              style={{
                width: `${size.widthIn}in`,
                height: `${size.heightIn}in`,
                transform: `scale(${scale})`,
                visibility: scale > 0 ? "visible" : "hidden",
              }}
            >
              <VerseSheet
                text={text}
                reference={reference}
                verseRef={verseRef}
                size={size}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
