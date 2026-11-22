"use client";

import { useEffect, useMemo, useState } from "react";
import type { Locale } from "@/i18n";
import { breakVerseLines, quoteLines } from "@/lib/composition";
import type { Orientation } from "@/lib/sizes";
import { type FitTextOptions, useFitText } from "@/lib/use-fit-text";

const MAX_LINE_PRESSURE = 12;

export function useFittedVerseLines(
  text: string,
  orientation: Orientation,
  locale: Locale,
  min: number,
  max: number,
  fitOptions?: Omit<FitTextOptions, "onFit">,
) {
  const [linePressure, setLinePressure] = useState(0);
  useEffect(() => {
    setLinePressure(0);
  }, [text, orientation, locale]);

  const lines = useMemo(
    () => quoteLines(breakVerseLines(text, orientation, linePressure), locale),
    [text, orientation, locale, linePressure],
  );

  const verseEl = useFitText(lines.join("\n"), min, max, {
    ...fitOptions,
    onFit: (_size, fits) => {
      if (!fits && linePressure < MAX_LINE_PRESSURE) {
        setLinePressure((value) => value + 1);
      }
    },
  });

  return { lines, verseEl, linePressure };
}