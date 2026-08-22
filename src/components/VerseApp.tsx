"use client";

import { useEffect, useMemo, useState } from "react";
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
  getOrientedSize,
  getPrintSize,
  PRINT_SIZES,
} from "@/lib/sizes";
import {
  PAYWALL_ENABLED,
  ticketUnlocks,
  PRINT_FULFILLMENT_LABEL,
  PRINT_OFFER_LABEL,
  PRINT_PRICE_LABEL,
} from "@/lib/print-ticket";
import type { Bible, VerseChoice } from "@/lib/types";
import { CloseupTableau } from "./CloseupTableau";
import { LifestyleCarousel } from "./LifestyleCarousel";
import { PdfPack } from "./PdfPack";
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
  const [paidTicket, setPaidTicket] = useState<string | null>(null);
  const [payError, setPayError] = useState<string | null>(null);
  const printSize = getPrintSize(sizeId);
  const verticalSize = getOrientedSize(printSize, "vertical");
  const horizontalSize = getOrientedSize(printSize, "horizontal");

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
  const isPaid = Boolean(
    liveChoice &&
      (!PAYWALL_ENABLED || (paidTicket && ticketUnlocks(paidTicket, liveChoice))),
  );

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
      <header className="app-chrome site-header">
        <p className="brand-mark">Bible Print</p>
        <p className="header-meta">PDF prêts à encadrer</p>
      </header>

      <section className="app-chrome intro">
        <h1>Un verset. Des PDF. Chez vous.</h1>
        <p>
          Calligraphie soignée, filet doré. Vous voyez le rendu dans la pièce.
          Rien n’est imprimé ici : {PRINT_PRICE_LABEL} pour {PRINT_OFFER_LABEL},
          puis vous faites tirer le format choisi chez un imprimeur et vous trouvez un cadre aux bonnes dimensions.
        </p>
      </section>

      {liveChoice ? (
        <>
          {isPaid ? (
            <style>{`
              @media print {
                @page { size: ${printSize.widthIn}in ${printSize.heightIn}in; margin: 0; }
                .print-sheet,
                .print-sheet .sheet-scale {
                  width: ${printSize.widthIn}in !important;
                  height: ${printSize.heightIn}in !important;
                }
              }
            `}</style>
          ) : null}
          <div className="app-chrome buy-bar">
            <div className="buy-copy">
              <p className="buy-kicker">Votre composition</p>
              <p className="buy-ref">{reference}</p>
              <p className="buy-price">
                {PRINT_PRICE_LABEL}{" "}
                <span>{PRINT_FULFILLMENT_LABEL}</span>
              </p>
            </div>
            <PdfPack text={text} reference={reference} verseRef={liveChoice} />
          </div>
          {payError ? <p className="app-chrome field-error">{payError}</p> : null}
        </>
      ) : null}

      {liveChoice ? (
        <>
          <div className="app-chrome showroom">
            <div className="closeups">
              <CloseupTableau
                text={text}
                reference={reference}
                verseRef={liveChoice}
                size={verticalSize}
                finish="gold"
                label="Vertical"
              />
              <CloseupTableau
                text={text}
                reference={reference}
                verseRef={liveChoice}
                size={horizontalSize}
                finish="gold"
                label="Horizontal"
              />
            </div>
            <LifestyleCarousel
              text={text}
              reference={reference}
              verseRef={liveChoice}
              verticalSize={verticalSize}
              horizontalSize={horizontalSize}
              finish="gold"
            />
          </div>
          <p className="app-chrome size-caption">
            {isPaid
              ? `${formatSizeLabel(printSize)} · 12 PDF débloqués · le filet doré est dans le fichier, le cadre d’intérieur n’est pas fourni`
              : "Vertical et horizontal · salon en portrait, chambre en paysage · les cadres des photos ne sont pas fournis, seuls les PDF le sont"}
          </p>
          <div className="print-sheet" aria-hidden="true">
            <VerseSheet
              key={`${printSize.id}-${liveChoice.book}-${liveChoice.chapter}-${liveChoice.verse}-${liveChoice.sentence}`}
              text={text}
              reference={reference}
              verseRef={liveChoice}
              size={printSize}
            />
          </div>
        </>
      ) : null}

      <section className="app-chrome configure">
        <h2>Personnaliser</h2>
        <div
          className={`toolbar picker ${
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
                  {index + 1} - {sentencePreview(sentence)}
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
        </div>

        {!liveChoice ? (
          <p className="hint">
            {draft.book == null
              ? "Commencez par choisir un livre."
              : draft.chapter == null
                ? "Choisissez ensuite le chapitre."
                : "Choisissez ensuite le verset."}
          </p>
        ) : null}
      </section>

      <footer className="app-chrome site-footer">
        <ul className="trust-row">
          <li>Paiement sécurisé</li>
          <li>12 PDF, rien n’est imprimé</li>
          <li>Louis Segond 1910</li>
        </ul>
        <p className="footnote">
          {bible.translation} · {bible.copyright} · {PRINT_PRICE_LABEL}, {PRINT_OFFER_LABEL}.{" "}
          {PRINT_FULFILLMENT_LABEL}
        </p>
      </footer>
      <p className="print-denied" aria-hidden="true">
        Impression disponible après paiement ({PRINT_PRICE_LABEL}).
      </p>
    </div>
  );
}
