"use client";

import { useLayoutEffect, useRef } from "react";

function inkBounds(element: HTMLElement): DOMRect | null {
  const lines = element.querySelectorAll(".verse-line");
  if (lines.length === 0) return null;

  let top = Infinity;
  let right = -Infinity;
  let bottom = -Infinity;
  let left = Infinity;

  for (const line of lines) {
    const range = document.createRange();
    range.selectNodeContents(line);
    const rect = range.getBoundingClientRect();
    left = Math.min(left, rect.left);
    right = Math.max(right, rect.right);
    top = Math.min(top, rect.top);
    bottom = Math.max(bottom, rect.bottom);
  }

  if (!Number.isFinite(top)) return null;
  return new DOMRect(left, top, right - left, bottom - top);
}

export function useFitText(text: string, min: number, max: number) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const element = ref.current;
    const stage = element?.parentElement;
    if (!element || !stage) return;
    let cancelled = false;

    const fitsAt = (size: number) => {
      element.style.fontSize = `${size}px`;
      const stageBox = stage.getBoundingClientRect();
      const ink = inkBounds(element);
      if (!ink || stageBox.width < 8 || stageBox.height < 8) return false;

      const flourish = Math.max(4, size * 0.08);
      return (
        ink.left - flourish >= stageBox.left &&
        ink.right + flourish <= stageBox.right &&
        ink.top - flourish >= stageBox.top &&
        ink.bottom + flourish <= stageBox.bottom
      );
    };

    const fit = () => {
      if (cancelled) return;

      let low = min;
      let high = max;
      let best = min;

      for (let i = 0; i < 26; i += 1) {
        const mid = (low + high) / 2;
        if (fitsAt(mid)) {
          best = mid;
          low = mid + 0.12;
        } else {
          high = mid - 0.12;
        }
      }

      element.style.fontSize = `${best}px`;
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
  }, [text, min, max]);

  return ref;
}
