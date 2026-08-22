"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  clampChoice,
  formatReference,
  getChoiceText,
  getVerseText,
  loadBible,
} from "@/lib/bible";
import { sentencePreview, splitSentences } from "@/lib/sentences";
import {
  DEFAULT_SIZE_ID,
  formatSizeLabel,
  getPrintSize,
  PRINT_SIZES,
} from "@/lib/sizes";
import type { Bible, VerseChoice } from "@/lib/types";
import { VerseSheet } from "./VerseSheet";

type DraftPick = {
  book: number | null;
  chapter: number | null;
  verse: number | null;
  sentence: number;
};

const EMPTY_PICK: DraftPick = { book: null, chapter: null, verse: null, sentence: 0 };

export function VerseApp() {
  const [bible, setBible] = useState<Bible | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<DraftPick>(EMPTY_PICK);
  const [sizeId, setSizeId] = useState(DEFAULT_SIZE_ID);
  const [frameFinish, setFrameFinish] = useState<"oak" | "gold">("oak");
  const [scale, setScale] = useState(0.55);
  const frameRef = useRef<HTMLDivElement>(null);
  const printSize = getPrintSize(sizeId);

  useEffect(() => {
    let cancelled = false;
    loadBible()
      .then((data) => {
        if (cancelled) return;
        setBible(data);
        setDraft(EMPTY_PICK);
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
    if (!frame) return;

    const updateScale = () => {
      const sheetWidth = printSize.widthIn * 96;
      setScale(Math.min(1, frame.clientWidth / sheetWidth));
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(frame);
    return () => observer.disconnect();
  }, [draft.verse, printSize.widthIn, frameFinish]);

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

  const updateDraft = (next: DraftPick) => {
    setDraft(next);
  };

  if (error) {
    return (
      <main className="app-shell">
        <p className="status-message">{error}</p>
      </main>
    );
  }

  if (!bible) {
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
          Choisissez un verset, puis imprimez une page unique.
        </p>
      </header>

      <div
        className={`app-chrome toolbar picker ${
          draft.verse != null ? "has-ref" : draft.chapter != null ? "has-chapter" : "book-only"
        }`}
      >
        <label className="field field-grow">
          <span>Livre</span>
          <select
            value={draft.book ?? ""}
            onChange={(event) =>
              updateDraft({
                book: Number(event.target.value),
                chapter: null,
                verse: null,
                sentence: 0,
              })
            }
          >
            <option value="" disabled>
              Choisir un livre
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

        {draft.book != null ? (
          <label className="field field-narrow">
            <span>Chapitre</span>
            <select
              value={draft.chapter ?? ""}
              onChange={(event) =>
                updateDraft({
                  ...draft,
                  chapter: Number(event.target.value),
                  verse: null,
                  sentence: 0,
                })
              }
            >
              <option value="" disabled>
                Choisir
              </option>
              {Array.from({ length: chapterCount }, (_, index) => (
                <option key={index + 1} value={index + 1}>
                  {index + 1}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        {draft.chapter != null ? (
          <label className="field field-narrow">
            <span>Verset</span>
            <select
              value={draft.verse ?? ""}
              onChange={(event) =>
                updateDraft({
                  ...draft,
                  verse: Number(event.target.value),
                  sentence: 0,
                })
              }
            >
              <option value="" disabled>
                Choisir
              </option>
              {Array.from({ length: verseCount }, (_, index) => (
                <option key={index + 1} value={index + 1}>
                  {index + 1}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        {verseReady && draftSentences.length > 1 ? (
          <label className="field field-wide">
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
        ) : null}

        {verseReady ? (
          <label className="field field-wide">
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
        ) : null}

        {verseReady ? (
          <label className="field field-wide">
            <span>Cadre d’aperçu</span>
            <select
              value={frameFinish}
              onChange={(event) => setFrameFinish(event.target.value as "oak" | "gold")}
            >
              <option value="oak">Chêne clair</option>
              <option value="gold">Or fin</option>
            </select>
          </label>
        ) : null}
      </div>

      {!liveChoice ? (
        <p className="app-chrome hint">
          {draft.book == null
            ? "Commencez par choisir un livre."
            : draft.chapter == null
              ? "Choisissez ensuite le chapitre."
              : "Choisissez ensuite le verset."}
        </p>
      ) : null}

      {liveChoice ? (
        <>
          <style>{`
            @media print {
              @page { size: ${printSize.widthIn}in ${printSize.heightIn}in; margin: 0; }
              .app-shell,
              .preview-wrap,
              .room,
              .picture-frame,
              .preview-frame,
              .sheet-scale {
                width: ${printSize.widthIn}in !important;
                height: ${printSize.heightIn}in !important;
              }
            }
          `}</style>
          <p className="app-chrome size-caption">
            {formatSizeLabel(printSize)} · aperçu encadré, le cadre n’est pas imprimé
          </p>
          <div className="preview-wrap">
            <div className="room">
              <div className="picture-frame" data-finish={frameFinish}>
                <div className="preview-frame" ref={frameRef}>
                  <div
                    className="sheet-scale"
                    style={{
                      transform: `scale(${scale})`,
                      height: `${printSize.heightIn * scale}in`,
                    }}
                  >
                    <VerseSheet
                      key={`${printSize.id}-${liveChoice.book}-${liveChoice.chapter}-${liveChoice.verse}-${liveChoice.sentence}`}
                      text={text}
                      reference={reference}
                      verseRef={liveChoice}
                      size={printSize}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="app-chrome preview-actions">
            <button className="print-button validate-button" type="button" onClick={() => window.print()}>
              Imprimer
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
