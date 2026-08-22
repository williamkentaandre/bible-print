"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  clampChoice,
  DEFAULT_CHOICE,
  formatReference,
  getChoiceText,
  getVerseText,
  isValidRef,
  loadBible,
} from "@/lib/bible";
import { sentencePreview, splitSentences } from "@/lib/sentences";
import type { Bible, VerseChoice } from "@/lib/types";
import {
  DEFAULT_SIZE_ID,
  formatSizeLabel,
  getPrintSize,
  PRINT_SIZES,
} from "@/lib/sizes";
import { VerseSheet } from "./VerseSheet";

type Stage = "edit" | "confirm" | "preview";

export function VerseApp() {
  const [bible, setBible] = useState<Bible | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<VerseChoice>(DEFAULT_CHOICE);
  const [typedError, setTypedError] = useState<string | null>(null);
  const [pending, setPending] = useState<VerseChoice | null>(null);
  const [preview, setPreview] = useState<VerseChoice | null>(null);
  const [sizeId, setSizeId] = useState(DEFAULT_SIZE_ID);
  const [scale, setScale] = useState(0.55);
  const frameRef = useRef<HTMLDivElement>(null);
  const printSize = getPrintSize(sizeId);
  const confirmRef = useRef<HTMLDivElement>(null);

  const stage: Stage = preview ? "preview" : pending ? "confirm" : "edit";

  useEffect(() => {
    let cancelled = false;
    loadBible()
      .then((data) => {
        if (cancelled) return;
        setBible(data);
        setDraft(clampChoice(data.books, DEFAULT_CHOICE));
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : "Chargement impossible.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame || stage !== "preview") return;

    const updateScale = () => {
      const sheetWidth = printSize.widthIn * 96;
      setScale(Math.min(1, frame.clientWidth / sheetWidth));
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(frame);
    return () => observer.disconnect();
  }, [stage, preview, printSize.widthIn]);

  useEffect(() => {
    if (stage === "confirm") {
      confirmRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [stage]);

  const book = bible?.books[draft.book];
  const chapterCount = book?.chapters.length ?? 1;
  const verseCount = book?.chapters[draft.chapter - 1]?.length ?? 1;

  const shownRef = preview ?? pending ?? draft;
  const draftSentences = useMemo(
    () => splitSentences(bible ? getVerseText(bible.books, draft) : ""),
    [bible, draft],
  );
  const text = useMemo(
    () => (bible ? getChoiceText(bible.books, shownRef) : ""),
    [bible, shownRef],
  );
  const reference = bible ? formatReference(bible.books, shownRef) : "";
  const phraseOnly = shownRef.sentence > 0;

  const updateDraft = (next: VerseChoice) => {
    if (!bible) return;
    setDraft(clampChoice(bible.books, next));
    setTypedError(null);
    setPending(null);
    setPreview(null);
  };

  const submitSelection = () => {
    if (!bible) return;
    if (!isValidRef(bible.books, draft)) {
      setTypedError("Ce chapitre ou ce verset n’existe pas dans ce livre.");
      setPending(null);
      setPreview(null);
      return;
    }

    setTypedError(null);
    setPending(draft);
    setPreview(null);
  };

  if (error) {
    return (
      <main className="app-shell">
        <p className="status-message">{error}</p>
      </main>
    );
  }

  if (!bible || !book) {
    return (
      <main className="app-shell">
        <p className="status-message">Chargement de la Bible…</p>
      </main>
    );
  }

  return (
    <div className="app-shell">
      <header className="app-chrome topbar">
        <div className="brand">
          <p className="brand-kicker">Impression</p>
          <h1>Bible Print</h1>
        </div>
        <p className="brand-tagline">
          Choisissez, confirmez, puis imprimez une page unique.
        </p>
      </header>

      <form
        className="app-chrome toolbar"
        onSubmit={(event) => {
          event.preventDefault();
          submitSelection();
        }}
      >
        <label className="field field-grow">
          <span>Livre</span>
          <select
            value={draft.book}
            onChange={(event) =>
              updateDraft({
                book: Number(event.target.value),
                chapter: 1,
                verse: 1,
                sentence: 0,
              })
            }
          >
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
          <span>Chapitre</span>
          <select
            value={draft.chapter}
            onChange={(event) =>
              updateDraft({
                ...draft,
                chapter: Number(event.target.value),
                verse: 1,
                sentence: 0,
              })
            }
          >
            {Array.from({ length: chapterCount }, (_, index) => (
              <option key={index + 1} value={index + 1}>
                {index + 1}
              </option>
            ))}
          </select>
        </label>

        <label className="field field-narrow">
          <span>Verset</span>
          <select
            value={draft.verse}
            onChange={(event) =>
              updateDraft({
                ...draft,
                verse: Number(event.target.value),
                sentence: 0,
              })
            }
          >
            {Array.from({ length: verseCount }, (_, index) => (
              <option key={index + 1} value={index + 1}>
                {index + 1}
              </option>
            ))}
          </select>
        </label>

        <button className="ghost-button" type="submit">
          Valider
        </button>
      </form>

      {draftSentences.length > 1 ? (
        <div className="app-chrome toolbar phrase-bar">
          <label className="field field-grow">
            <span>Phrase</span>
            <select
              value={draft.sentence}
              onChange={(event) =>
                updateDraft({
                  ...draft,
                  sentence: Number(event.target.value),
                })
              }
            >
              <option value={0}>Tout le verset</option>
              {draftSentences.map((sentence, index) => (
                <option key={`${index}-${sentence}`} value={index + 1}>
                  {index + 1} — {sentencePreview(sentence)}
                </option>
              ))}
            </select>
          </label>
        </div>
      ) : null}

      <div className="app-chrome toolbar size-bar">
        <label className="field field-grow">
          <span>Taille</span>
          <select value={sizeId} onChange={(event) => setSizeId(event.target.value)}>
            <optgroup label="Vertical">
              {PRINT_SIZES.filter((size) => size.orientation === "vertical").map((size) => (
                <option key={size.id} value={size.id}>
                  {formatSizeLabel(size)}
                </option>
              ))}
            </optgroup>
            <optgroup label="Horizontal">
              {PRINT_SIZES.filter((size) => size.orientation === "horizontal").map((size) => (
                <option key={size.id} value={size.id}>
                  {formatSizeLabel(size)}
                </option>
              ))}
            </optgroup>
          </select>
        </label>
      </div>

      {typedError ? <p className="app-chrome field-error">{typedError}</p> : null}

      {stage === "edit" ? (
        <p className="app-chrome hint">
          Choisissez le livre, le chapitre et le verset. S’il y a plusieurs phrases, vous
          pouvez n’en garder qu’une, puis validez.
        </p>
      ) : null}

      {stage === "confirm" && pending ? (
        <div className="app-chrome confirm-card" ref={confirmRef}>
          <p className="confirm-kicker">
            {phraseOnly ? "Confirmer cette phrase" : "Confirmer ce verset"}
          </p>
          <p className="confirm-ref">{formatReference(bible.books, pending)}</p>
          <p className="confirm-excerpt">« {text} »</p>
          <p className="confirm-copy">
            {phraseOnly
              ? "Cette phrase seule sera composée, au format choisi."
              : "Une composition unique sera créée pour cette référence, au format choisi."}
          </p>
          <button
            className="print-button confirm-button"
            type="button"
            onClick={() => setPreview(pending)}
          >
            Voir l’aperçu
          </button>
        </div>
      ) : null}

      {stage === "preview" && preview ? (
        <>
          <style>{`
            @media print {
              @page { size: ${printSize.widthIn}in ${printSize.heightIn}in; margin: 0; }
              .app-shell,
              .preview-wrap,
              .preview-frame,
              .sheet-scale {
                width: ${printSize.widthIn}in !important;
                height: ${printSize.heightIn}in !important;
              }
            }
          `}</style>
          <p className="app-chrome size-caption">{formatSizeLabel(printSize)}</p>
          <div className="preview-wrap">
            <div className="preview-frame" ref={frameRef}>
              <div
                className="sheet-scale"
                style={{
                  transform: `scale(${scale})`,
                  height: `${printSize.heightIn * scale}in`,
                }}
              >
                <VerseSheet
                  key={`${printSize.id}-${preview.sentence}`}
                  text={text}
                  reference={reference}
                  verseRef={preview}
                  size={printSize}
                />
              </div>
            </div>
          </div>
          <div className="app-chrome preview-actions">
            <button className="print-button" type="button" onClick={() => window.print()}>
              Imprimer
            </button>
            <button
              className="ghost-button"
              type="button"
              onClick={() => {
                setPreview(null);
                setPending(null);
              }}
            >
              Choisir un autre verset
            </button>
          </div>
        </>
      ) : null}

      <p className="app-chrome footnote">
        {bible.translation} · {bible.copyright} · un verset par feuille
      </p>
    </div>
  );
}
