"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  clampChoice,
  DEFAULT_CHOICE,
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
import { printTicket, PRINT_PRICE_LABEL } from "@/lib/print-ticket";
import type { Bible, VerseChoice } from "@/lib/types";
import { VerseSheet } from "./VerseSheet";

type DraftPick = {
  book: number | null;
  chapter: number | null;
  verse: number | null;
  sentence: number;
};

const DEFAULT_PICK: DraftPick = {
  book: DEFAULT_CHOICE.book,
  chapter: DEFAULT_CHOICE.chapter,
  verse: DEFAULT_CHOICE.verse,
  sentence: DEFAULT_CHOICE.sentence,
};

export function VerseApp() {
  const [bible, setBible] = useState<Bible | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<DraftPick>(DEFAULT_PICK);
  const [sizeId, setSizeId] = useState(DEFAULT_SIZE_ID);
  const [frameFinish, setFrameFinish] = useState<"oak" | "gold">("oak");
  const [paidTicket, setPaidTicket] = useState<string | null>(null);
  const [payBusy, setPayBusy] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  const [scale, setScale] = useState(0.55);
  const frameRef = useRef<HTMLDivElement>(null);
  const printSize = getPrintSize(sizeId);

  useEffect(() => {
    let cancelled = false;
    loadBible()
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
  }, [draft.verse, printSize.widthIn, frameFinish, bible]);

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
  const ticket = liveChoice ? printTicket(liveChoice, sizeId) : null;
  const isPaid = Boolean(ticket && paidTicket === ticket);

  useEffect(() => {
    document.body.classList.toggle("is-paid", isPaid);
    return () => document.body.classList.remove("is-paid");
  }, [isPaid]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("cancel") === "1") {
      window.history.replaceState({}, "", window.location.pathname);
      queueMicrotask(() => setPayError("Paiement annulé."));
    }

    const sessionId = params.get("checkout");
    if (!sessionId) return;

    let cancelled = false;
    fetch(`/api/checkout/verify?session_id=${encodeURIComponent(sessionId)}`)
      .then((response) => response.json())
      .then((data: { paid?: boolean; ticket?: string | null }) => {
        if (cancelled || !data.paid || !data.ticket) return;
        setPaidTicket(data.ticket);
        window.history.replaceState({}, "", window.location.pathname);
      })
      .catch(() => {
        if (!cancelled) setPayError("Le paiement n’a pas pu être vérifié.");
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const startCheckout = async () => {
    if (!ticket || !reference) return;
    setPayBusy(true);
    setPayError(null);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticket, reference }),
      });
      const data = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !data.url) {
        throw new Error(data.error || "Paiement indisponible.");
      }
      window.location.href = data.url;
    } catch (cause) {
      setPayError(cause instanceof Error ? cause.message : "Paiement indisponible.");
      setPayBusy(false);
    }
  };

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
          Choisissez un verset. L’impression coûte {PRINT_PRICE_LABEL}.
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
          {isPaid ? (
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
          ) : null}
          <p className="app-chrome size-caption">
            {isPaid
              ? `${formatSizeLabel(printSize)} · le double filet doré est imprimé, le cadre mural non`
              : `${formatSizeLabel(printSize)} · aperçu uniquement · impression ${PRINT_PRICE_LABEL}`}
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
            {isPaid ? (
              <button className="print-button validate-button" type="button" onClick={() => window.print()}>
                Imprimer
              </button>
            ) : (
              <button
                className="print-button validate-button"
                type="button"
                disabled={payBusy}
                onClick={() => void startCheckout()}
              >
                {payBusy ? "Redirection…" : `Obtenir l’impression — ${PRINT_PRICE_LABEL}`}
              </button>
            )}
          </div>
          {payError ? <p className="app-chrome field-error">{payError}</p> : null}
        </>
      ) : null}

      <p className="app-chrome footnote">
        {bible.translation} · {bible.copyright} · impression {PRINT_PRICE_LABEL} par feuille
      </p>
      <p className="print-denied" aria-hidden="true">
        Impression disponible après paiement ({PRINT_PRICE_LABEL}).
      </p>
    </div>
  );
}
