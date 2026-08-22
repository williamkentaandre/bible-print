"use client";

import { useLayoutEffect, useRef, useState } from "react";
import type { Locale } from "@/i18n";
import type { BackgroundId } from "@/lib/backgrounds";
import type { PrintSize } from "@/lib/sizes";
import type { VerseRef } from "@/lib/types";
import { VerseSheet } from "./VerseSheet";

type ScaledSheetProps = {
  text: string;
  reference: string;
  verseRef: VerseRef;
  size: PrintSize;
  palette: BackgroundId;
  locale?: Locale;
};

export function ScaledSheet({ text, reference, verseRef, size, palette, locale }: ScaledSheetProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  useLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const apply = () => {
      const width = frame.clientWidth;
      const sheetPx = size.widthIn * 96;
      setScale(width > 0 && sheetPx > 0 ? width / sheetPx : 0);
    };

    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(frame);
    return () => observer.disconnect();
  }, [size.widthIn]);

  return (
    <div className="preview-frame" ref={frameRef}>
      {scale > 0 ? (
        <div
          className="sheet-scale"
          style={{
            width: `${size.widthIn}in`,
            height: `${size.heightIn}in`,
            transform: `scale(${scale})`,
          }}
        >
          <VerseSheet
            text={text}
            reference={reference}
            verseRef={verseRef}
            size={size}
            palette={palette}
            locale={locale}
          />
        </div>
      ) : null}
    </div>
  );
}
