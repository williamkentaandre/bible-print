"use client";

import { useState } from "react";
import { fileSafe } from "@/lib/file-name";
import { PRINT_FORMAT_COUNT, PRINT_SIZES, formatSizeLabel, type PrintSize } from "@/lib/sizes";
import type { VerseRef } from "@/lib/types";
import { VerseSheet } from "./VerseSheet";

type PdfPackProps = {
  text: string;
  reference: string;
  verseRef: VerseRef;
};

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export function PdfPack({ text, reference, verseRef }: PdfPackProps) {
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [captureSize, setCaptureSize] = useState<PrintSize>(PRINT_SIZES[0]);

  const downloadAll = async () => {
    setBusy(true);
    setError(null);
    try {
      const [{ default: JSZip }, { jsPDF }, html2canvas] = await Promise.all([
        import("jszip"),
        import("jspdf"),
        import("html2canvas").then((module) => module.default),
      ]);
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }

      const zip = new JSZip();
      const base = fileSafe(reference) || "verset";

      for (let index = 0; index < PRINT_SIZES.length; index += 1) {
        const size = PRINT_SIZES[index];
        setCaptureSize(size);
        setStep(index + 1);
        await wait(80);
        await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
        await wait(320);

        const sheet = document.querySelector(".pdf-capture .sheet");
        if (!(sheet instanceof HTMLElement)) {
          throw new Error("Feuille introuvable.");
        }

        const canvas = await html2canvas(sheet, {
          scale: 2,
          backgroundColor: "#ffffff",
          useCORS: true,
        });
        const pdf = new jsPDF({
          orientation: size.orientation === "horizontal" ? "landscape" : "portrait",
          unit: "in",
          format: [size.widthIn, size.heightIn],
        });
        pdf.addImage(canvas.toDataURL("image/jpeg", 0.93), "JPEG", 0, 0, size.widthIn, size.heightIn);
        zip.file(`${base}-${fileSafe(formatSizeLabel(size))}.pdf`, pdf.output("blob"));
      }

      const blob = await zip.generateAsync({ type: "blob" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${base}-12-pdf.zip`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch {
      setError("Le téléchargement n’a pas pu être préparé.");
    } finally {
      setBusy(false);
      setStep(0);
    }
  };

  return (
    <div className="pdf-actions">
      <button
        className="print-button validate-button"
        type="button"
        disabled={busy}
        onClick={() => void downloadAll()}
      >
        {busy
          ? `Préparation ${step}/${PRINT_FORMAT_COUNT}…`
          : `Télécharger`}
      </button>
      {error ? <p className="field-error">{error}</p> : null}
      <div className="pdf-capture" aria-hidden="true">
        <VerseSheet
          key={captureSize.id}
          text={text}
          reference={reference}
          verseRef={verseRef}
          size={captureSize}
        />
      </div>
    </div>
  );
}
