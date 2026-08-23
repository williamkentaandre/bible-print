"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { FondPicker } from "@/components/FondPicker";
import { StudioPin } from "@/components/StudioPin";
import {
  PIN_CREDIT_H,
  PIN_H,
  PIN_W,
  printExportSize,
  StudioExportSheet,
} from "@/components/StudioExportSheet";
import { getBackground, DEFAULT_BACKGROUND, type BackgroundId } from "@/lib/backgrounds";
import {
  clampChoice,
  DEFAULT_CHOICE,
  formatReference,
  getChoiceText,
  getVerseText,
  loadBible,
} from "@/lib/bible";
import { fileSafe } from "@/lib/file-name";
import { LIFESTYLE_SCENES, type FrameFinish, type LifestyleScene } from "@/lib/scenes";
import { sentencePreview, splitSentences } from "@/lib/sentences";
import {
  DEFAULT_SIZE_ID,
  formatSizeLabel,
  getOrientedSize,
  getPrintSize,
  PRINT_SIZES,
} from "@/lib/sizes";
import type { Bible, VerseChoice } from "@/lib/types";

type DraftPick = {
  book: number | null;
  chapter: number | null;
  verse: number | null;
  sentence: number;
};

const PIN_WIDTH = PIN_W;
const PIN_HEIGHT = PIN_H;
const ZOOM_MIN = 0.5;
const ZOOM_MAX = 1.75;
const ZOOM_STEP = 0.15;

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function rasterize(element: HTMLElement, backgroundColor: string) {
  if (document.fonts?.ready) await document.fonts.ready;
  await wait(60);
  await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
  for (let attempt = 0; attempt < 25; attempt += 1) {
    const verse = element.querySelector(".verse-text");
    if (verse instanceof HTMLElement && parseFloat(verse.style.fontSize) > 8) break;
    await wait(40);
  }
  await wait(180);
  const { default: html2canvas } = await import("html2canvas");
  return html2canvas(element, {
    scale: 2,
    width: element.offsetWidth,
    height: element.offsetHeight,
    backgroundColor,
    useCORS: true,
    logging: false,
  });
}

function clampZoom(value: number) {
  return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round(value * 100) / 100));
}

function pinCaption(reference: string) {
  return `${reference}

Le verset que vous aimez, accroché chez vous.

bibledeco.com`;
}

function downloadBlob(blob: Blob, name: string) {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = name;
  link.click();
  URL.revokeObjectURL(link.href);
}

async function preloadScenes() {
  await Promise.all(
    LIFESTYLE_SCENES.map((scene) => {
      const image = new Image();
      image.src = scene.src;
      return image.decode().catch(() => undefined);
    }),
  );
}

export function PinStudio() {
  const [bible, setBible] = useState<Bible | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<DraftPick>(DEFAULT_CHOICE);
  const [sizeId, setSizeId] = useState(DEFAULT_SIZE_ID);
  const [palette, setPalette] = useState<BackgroundId>(DEFAULT_BACKGROUND);
  const [finish, setFinish] = useState<FrameFinish>("gold");
  const [sceneId, setSceneId] = useState(LIFESTYLE_SCENES[0].id);
  const [mode, setMode] = useState<"scene" | "sheet">("scene");
  const [credit, setCredit] = useState(true);
  const [zoomByScene, setZoomByScene] = useState<Record<string, number>>({
    salon: 1,
    chambre: 1,
    couloir: 1,
    salle: 1,
  });
  const [busy, setBusy] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const captureRef = useRef<HTMLDivElement>(null);
  const exportPinRef = useRef<HTMLDivElement>(null);
  const printCardRef = useRef<HTMLDivElement>(null);
  const printSize = getPrintSize(sizeId);
  const scene = LIFESTYLE_SCENES.find((item) => item.id === sceneId) ?? LIFESTYLE_SCENES[0];
  const framedSize = getOrientedSize(printSize, scene.orientation);
  const sheetSize = getOrientedSize(printSize, "vertical");
  const pinSize = mode === "sheet" ? sheetSize : framedSize;
  const zoom = zoomByScene[scene.id] ?? 1;
  const printPx = printExportSize(pinSize);
  const exportSheetH = credit ? PIN_H - PIN_CREDIT_H : PIN_H;

  useEffect(() => {
    let cancelled = false;
    loadBible("fr")
      .then((data) => {
        if (cancelled) return;
        setBible(data);
        const next = clampChoice(data.books, DEFAULT_CHOICE);
        setDraft({
          book: next.book,
          chapter: next.chapter,
          verse: next.verse,
          sentence: next.sentence,
        });
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : "Impossible de charger la Bible.");
        }
      });
    void preloadScenes();
    return () => {
      cancelled = true;
    };
  }, []);

  const book = draft.book != null ? bible?.books[draft.book] : undefined;
  const chapterCount = book?.chapters.length ?? 0;
  const verseCount =
    book && draft.chapter != null ? (book.chapters[draft.chapter - 1]?.length ?? 0) : 0;
  const verseReady = draft.book != null && draft.chapter != null && draft.verse != null;

  const liveChoice = useMemo((): VerseChoice | null => {
    if (!bible || draft.book == null || draft.chapter == null || draft.verse == null) {
      return null;
    }
    return clampChoice(bible.books, {
      book: draft.book,
      chapter: draft.chapter,
      verse: draft.verse,
      sentence: draft.sentence,
    });
  }, [bible, draft.book, draft.chapter, draft.verse, draft.sentence]);

  const draftSentences = useMemo(() => {
    if (!bible || liveChoice == null) return [];
    return splitSentences(getVerseText(bible.books, liveChoice));
  }, [bible, liveChoice]);
  const text = useMemo(
    () => (bible && liveChoice ? getChoiceText(bible.books, liveChoice) : ""),
    [bible, liveChoice],
  );
  const reference = bible && liveChoice ? formatReference(bible.books, liveChoice) : "";

  const captureCanvas = async (kind: "scene" | "sheet" = mode) => {
    const paper = getBackground(palette).capture;
    if (kind === "sheet") {
      const pin = exportPinRef.current;
      if (!pin) throw new Error("Épingle introuvable.");
      return rasterize(pin, paper);
    }

    const card = printCardRef.current;
    const root = captureRef.current;
    if (!card || !root) throw new Error("Aperçu introuvable.");
    const sheet = await rasterize(card, paper);
    const sheetUrl = sheet.toDataURL("image/png");
    const { default: html2canvas } = await import("html2canvas");
    await wait(80);
    return html2canvas(root, {
      scale: 2,
      width: PIN_WIDTH,
      height: PIN_HEIGHT,
      backgroundColor: "#e6dfd3",
      useCORS: true,
      logging: false,
      onclone: (doc) => {
        const capture = doc.querySelector(".studio-capture");
        if (capture instanceof HTMLElement) {
          capture.style.left = "0";
          capture.style.top = "0";
          capture.style.opacity = "1";
          capture.style.position = "relative";
        }
        const frame = doc.querySelector(".studio-capture .preview-frame");
        if (!(frame instanceof HTMLElement)) return;
        const img = doc.createElement("img");
        img.src = sheetUrl;
        img.alt = "";
        img.style.width = "100%";
        img.style.height = "100%";
        img.style.objectFit = "fill";
        img.style.display = "block";
        frame.replaceChildren(img);
      },
    });
  };

  const runCapture = async (label: string, work: () => Promise<void>) => {
    if (!liveChoice) return;
    setBusy(label);
    document.documentElement.classList.add("is-capturing-pin");
    try {
      await work();
    } catch {
      setError("La photo n’a pas pu être créée. Réessayez.");
    } finally {
      document.documentElement.classList.remove("is-capturing-pin");
      setBusy(null);
    }
  };

  const downloadCurrent = () =>
    runCapture("photo", async () => {
      const canvas = await captureCanvas();
      const base = fileSafe(reference) || "verset";
      const suffix = mode === "sheet" ? "feuille" : scene.id;
      await new Promise<void>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Image vide."));
              return;
            }
            downloadBlob(blob, `bibledeco-${base}-${suffix}.jpg`);
            resolve();
          },
          "image/jpeg",
          0.92,
        );
      });
    });

  const downloadRooms = () =>
    runCapture("pièces", async () => {
      const [{ default: JSZip }] = await Promise.all([import("jszip")]);
      const zip = new JSZip();
      const base = fileSafe(reference) || "verset";
      const previousMode = mode;
      const previousScene = sceneId;
      flushSync(() => setMode("scene"));
      for (const item of LIFESTYLE_SCENES) {
        flushSync(() => setSceneId(item.id));
        await wait(80);
        await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
        const canvas = await captureCanvas("scene");
        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob(
            (file) => (file ? resolve(file) : reject(new Error("Image vide."))),
            "image/jpeg",
            0.92,
          );
        });
        zip.file(`bibledeco-${base}-${item.id}.jpg`, blob);
      }
      setMode(previousMode);
      setSceneId(previousScene);
      const archive = await zip.generateAsync({ type: "blob" });
      downloadBlob(archive, `bibledeco-${base}-pieces.zip`);
    });

  const copyCaption = async () => {
    if (!reference) return;
    try {
      await navigator.clipboard.writeText(pinCaption(reference));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("Impossible de copier le texte.");
    }
  };

  const logout = async () => {
    await fetch("/api/studio/logout", { method: "POST" });
    window.location.replace("/studio");
  };

  if (error && !bible) {
    return (
      <main className="studio-shell">
        <p className="status-message">{error}</p>
      </main>
    );
  }

  if (!bible) {
    return (
      <main className="studio-shell">
        <p className="status-message">Chargement de la Bible…</p>
      </main>
    );
  }

  return (
    <div className="studio-shell">
      <header className="site-header studio-header">
        <p className="brand-mark">Bible Deco · Studio</p>
        <button className="text-link" type="button" onClick={() => void logout()}>
          Quitter
        </button>
      </header>

      <p className="studio-lead">
        Choisissez un verset, cadrez la pièce, téléchargez une photo 1000 × 1500 pour Pinterest.
        Rien n’est publié : les fichiers restent sur votre ordinateur.
      </p>

      <div className="studio-layout">
        <section className="configure studio-controls">
          <h2>Verset</h2>
          <div className="toolbar picker has-ref">
            <label className="field field-grow">
              <span className="field-legend">Livre</span>
              <select
                value={draft.book ?? ""}
                onChange={(event) =>
                  setDraft({
                    book: Number(event.target.value),
                    chapter: null,
                    verse: null,
                    sentence: 0,
                  })
                }
              >
                <option value="" disabled>
                  Choisir
                </option>
                <optgroup label="Ancien Testament">
                  {bible.books.map((item, index) =>
                    item.testament === "AT" ? (
                      <option key={item.name} value={index}>
                        {item.name}
                      </option>
                    ) : null,
                  )}
                </optgroup>
                <optgroup label="Nouveau Testament">
                  {bible.books.map((item, index) =>
                    item.testament === "NT" ? (
                      <option key={item.name} value={index}>
                        {item.name}
                      </option>
                    ) : null,
                  )}
                </optgroup>
              </select>
            </label>
            <label className="field field-narrow">
              <span className="field-legend">Chapitre</span>
              <select
                value={draft.chapter ?? ""}
                disabled={draft.book == null}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    chapter: Number(event.target.value),
                    verse: null,
                    sentence: 0,
                  })
                }
              >
                <option value="" disabled>
                  —
                </option>
                {Array.from({ length: chapterCount }, (_, index) => (
                  <option key={index + 1} value={index + 1}>
                    {index + 1}
                  </option>
                ))}
              </select>
            </label>
            <label className="field field-narrow">
              <span className="field-legend">Verset</span>
              <select
                value={draft.verse ?? ""}
                disabled={draft.chapter == null}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    verse: Number(event.target.value),
                    sentence: 0,
                  })
                }
              >
                <option value="" disabled>
                  —
                </option>
                {Array.from({ length: verseCount }, (_, index) => (
                  <option key={index + 1} value={index + 1}>
                    {index + 1}
                  </option>
                ))}
              </select>
            </label>
            {verseReady && draftSentences.length > 1 ? (
              <label className="field field-wide">
                <span className="field-legend">Phrase</span>
                <select
                  value={draft.sentence}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      sentence: Number(event.target.value),
                    })
                  }
                >
                  <option value={0}>Verset entier</option>
                  {draftSentences.map((sentence, index) => (
                    <option key={`${index}-${sentence}`} value={index + 1}>
                      {index + 1} - {sentencePreview(sentence)}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            <label className="field field-wide">
              <span className="field-legend">Taille du cadre</span>
              <select value={sizeId} onChange={(event) => setSizeId(event.target.value)}>
                {PRINT_SIZES.filter((size) => size.orientation === "vertical").map((size) => (
                  <option key={size.id} value={size.id}>
                    {formatSizeLabel(size)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <FondPicker value={palette} onChange={setPalette} />

          <fieldset className="studio-fieldset">
            <legend>Cadre</legend>
            <label>
              <input
                type="radio"
                name="finish"
                checked={finish === "gold"}
                onChange={() => setFinish("gold")}
              />
              Doré
            </label>
            <label>
              <input
                type="radio"
                name="finish"
                checked={finish === "oak"}
                onChange={() => setFinish("oak")}
              />
              Chêne
            </label>
          </fieldset>

          <fieldset className="studio-fieldset">
            <legend>Photo</legend>
            <div className="studio-scenes">
              {LIFESTYLE_SCENES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="studio-scene-btn"
                  data-selected={mode === "scene" && sceneId === item.id ? "true" : "false"}
                  style={{ backgroundImage: `url(${item.src})` }}
                  onClick={() => {
                    setMode("scene");
                    setSceneId(item.id);
                  }}
                >
                  <span>{item.label}</span>
                </button>
              ))}
              <button
                type="button"
                className="studio-scene-btn studio-scene-sheet"
                data-selected={mode === "sheet" ? "true" : "false"}
                onClick={() => setMode("sheet")}
              >
                <span>Feuille seule</span>
              </button>
            </div>
          </fieldset>

          <label className="studio-check">
            <input
              type="checkbox"
              checked={credit}
              onChange={(event) => setCredit(event.target.checked)}
            />
            Mention bibledeco.com en bas de l’image
          </label>

          {liveChoice ? (
            <div className="studio-actions">
              <p className="buy-ref">{reference}</p>
              <button
                className="print-button cta-button"
                type="button"
                disabled={Boolean(busy)}
                onClick={() => void downloadCurrent()}
              >
                {busy === "photo" ? "Création de la photo…" : "Télécharger cette épingle"}
              </button>
              <button
                className="print-button"
                type="button"
                disabled={Boolean(busy)}
                onClick={() => void downloadRooms()}
              >
                {busy === "pièces" ? "Préparation des 4 pièces…" : "Les 4 pièces en ZIP"}
              </button>
              <button className="text-link" type="button" onClick={() => void copyCaption()}>
                {copied ? "Texte copié." : "Copier le texte Pinterest"}
              </button>
            </div>
          ) : (
            <p className="studio-hint">Choisissez livre, chapitre et verset.</p>
          )}
          {error ? <p className="field-error">{error}</p> : null}
        </section>

        {liveChoice ? (
          <section className="studio-stage" aria-label="Aperçu de l’épingle">
            <div className="studio-preview">
              <StudioPin
                mode={mode}
                scene={scene}
                size={pinSize}
                text={text}
                reference={reference}
                verseRef={liveChoice}
                palette={palette}
                finish={finish}
                zoom={zoom}
                credit={credit}
              />
              {mode === "scene" ? (
                <div className="lifestyle-zoom" role="group" aria-label="Cadrage">
                  <button
                    type="button"
                    aria-label="Reculer"
                    disabled={zoom <= ZOOM_MIN}
                    onClick={() =>
                      setZoomByScene((current) => ({
                        ...current,
                        [scene.id]: clampZoom((current[scene.id] ?? 1) - ZOOM_STEP),
                      }))
                    }
                  >
                    −
                  </button>
                  <button
                    type="button"
                    aria-label="Rapprocher"
                    disabled={zoom >= ZOOM_MAX}
                    onClick={() =>
                      setZoomByScene((current) => ({
                        ...current,
                        [scene.id]: clampZoom((current[scene.id] ?? 1) + ZOOM_STEP),
                      }))
                    }
                  >
                    +
                  </button>
                </div>
              ) : null}
            </div>
            <p className="studio-preview-meta">Format épingle 2:3 · 2000 × 3000 px</p>
          </section>
        ) : null}
      </div>

      {liveChoice ? (
        <>
          <div className="studio-sheet-capture" aria-hidden="true">
            <div
              ref={exportPinRef}
              className="studio-export-pin"
              data-palette={palette}
              style={{ background: getBackground(palette).capture }}
            >
              <StudioExportSheet
                text={text}
                reference={reference}
                verseRef={liveChoice}
                palette={palette}
                width={PIN_W}
                height={exportSheetH}
              />
              {credit ? <p className="studio-pin-credit">bibledeco.com</p> : null}
            </div>
            <div ref={printCardRef}>
              <StudioExportSheet
                text={text}
                reference={reference}
                verseRef={liveChoice}
                palette={palette}
                width={printPx.width}
                height={printPx.height}
              />
            </div>
          </div>
          <div className="studio-capture" aria-hidden="true">
            <div ref={captureRef}>
              <StudioPin
                key={`${mode}-${scene.id}-${pinSize.id}-${palette}-${finish}-${credit}`}
                mode={mode}
                scene={scene}
                size={pinSize}
                text={text}
                reference={reference}
                verseRef={liveChoice}
                palette={palette}
                finish={finish}
                zoom={zoom}
                credit={credit}
              />
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
