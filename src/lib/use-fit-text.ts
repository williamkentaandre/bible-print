"use client";

import { useLayoutEffect, useRef } from "react";

function stageScale(stage: HTMLElement): number {
  const layout = stage.offsetWidth;
  const visual = stage.getBoundingClientRect().width;
  return layout > 0 && visual > 0 ? visual / layout : 1;
}

function inkInLayout(element: HTMLElement, stage: HTMLElement) {
  const lines = element.querySelectorAll(".verse-line");
  if (lines.length === 0) return null;

  const scale = stageScale(stage);
  const stageBox = stage.getBoundingClientRect();
  let top = Infinity;
  let right = -Infinity;
  let bottom = -Infinity;
  let left = Infinity;

  for (const line of lines) {
    const range = document.createRange();
    range.selectNodeContents(line);
    const rect = range.getBoundingClientRect();
    left = Math.min(left, (rect.left - stageBox.left) / scale);
    right = Math.max(right, (rect.right - stageBox.left) / scale);
    top = Math.min(top, (rect.top - stageBox.top) / scale);
    bottom = Math.max(bottom, (rect.bottom - stageBox.top) / scale);
  }

  if (!Number.isFinite(top)) return null;
  return { left, right, top, bottom };
}

export type FitTextOptions = {
  onFit?: (size: number, fits: boolean) => void;
  /** Extra bottom clearance as a fraction of font size (script descenders). */
  bottomPad?: number;
};

const ABSOLUTE_MIN = 10;

export function useFitText(
  text: string,
  min: number,
  max: number,
  onFitOrOptions?: ((size: number) => void) | FitTextOptions,
) {
  const options: FitTextOptions =
    typeof onFitOrOptions === "function" ? { onFit: onFitOrOptions } : (onFitOrOptions ?? {});
  const { onFit, bottomPad = 0 } = options;
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const element = ref.current;
    const stage = element?.parentElement;
    if (!element || !stage) return;
    let cancelled = false;

    const fitsAt = (size: number) => {
      element.style.fontSize = `${size}px`;
      const width = stage.offsetWidth;
      const height = stage.offsetHeight;
      if (width < 8 || height < 8) return false;
      const ink = inkInLayout(element, stage);
      if (!ink) return false;

      const side = Math.max(6, size * 0.11);
      const top = Math.max(6, size * 0.1);
      const bottom = Math.max(side, size * bottomPad);
      return (
        ink.left >= side &&
        ink.right <= width - side &&
        ink.top >= top &&
        ink.bottom <= height - bottom
      );
    };

    const fit = () => {
      if (cancelled) return;

      const searchMin = Math.min(min, max);
      let low = searchMin;
      let high = max;
      let best = searchMin;

      for (let i = 0; i < 28; i += 1) {
        const mid = (low + high) / 2;
        if (fitsAt(mid)) {
          best = mid;
          low = mid + 0.12;
        } else {
          high = mid - 0.12;
        }
      }

      while (best > ABSOLUTE_MIN && !fitsAt(best)) {
        best -= 0.35;
      }

      element.style.fontSize = `${best}px`;
      onFit?.(best, fitsAt(best));
    };

    const start = () => {
      if (cancelled) return;
      fit();
    };

    if (document.fonts?.ready) {
      void document.fonts.ready.then(start);
    } else {
      start();
    }

    const observer = new ResizeObserver(start);
    observer.observe(stage);
    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [text, min, max, onFit, bottomPad]);

  return ref;
}
