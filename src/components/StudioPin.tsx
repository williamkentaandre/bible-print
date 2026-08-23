"use client";

import type { CSSProperties } from "react";
import type { BackgroundId } from "@/lib/backgrounds";
import { hangStyle, sceneStyle, type FrameFinish, type LifestyleScene } from "@/lib/scenes";
import type { PrintSize } from "@/lib/sizes";
import type { VerseRef } from "@/lib/types";
import { ScaledSheet } from "./ScaledSheet";

type StudioPinProps = {
  mode: "scene" | "sheet";
  scene: LifestyleScene;
  size: PrintSize;
  text: string;
  reference: string;
  verseRef: VerseRef;
  palette: BackgroundId;
  finish: FrameFinish;
  zoom: number;
  credit: boolean;
};

export function StudioPin({
  mode,
  scene,
  size,
  text,
  reference,
  verseRef,
  palette,
  finish,
  zoom,
  credit,
}: StudioPinProps) {
  return (
    <div className="studio-pin" data-mode={mode} data-credit={credit ? "true" : "false"}>
      <div className="studio-pin-art">
        {mode === "sheet" ? (
          <div className="studio-sheet-board" data-palette={palette}>
            <div
              className="studio-sheet-fit"
              style={
                {
                  aspectRatio: `${size.widthIn} / ${size.heightIn}`,
                  "--sheet-ratio": String(size.widthIn / size.heightIn),
                } as CSSProperties
              }
            >
              <ScaledSheet
                text={text}
                reference={reference}
                verseRef={verseRef}
                size={size}
                palette={palette}
              />
            </div>
          </div>
        ) : (
          <div className="lifestyle-slide studio-pin-photo">
            <div className="lifestyle-scene" style={sceneStyle(scene, zoom)}>
              <div className="lifestyle-hang" data-scene={scene.id} style={hangStyle(scene, size)}>
                <div
                  className="lifestyle-art"
                  data-finish={finish}
                  data-orientation={size.orientation}
                >
                  <ScaledSheet
                    text={text}
                    reference={reference}
                    verseRef={verseRef}
                    size={size}
                    palette={palette}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {credit ? <p className="studio-pin-credit">bibledeco.com</p> : null}
    </div>
  );
}
