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
import { DEFAULT_BACKGROUND, type BackgroundId } from "@/lib/backgrounds";
import { getCopy, type Locale } from "@/i18n";
import {
  PAYWALL_ENABLED,
  printTicket,
  ticketUnlocks,
} from "@/lib/print-ticket";
import type { Bible, VerseChoice } from "@/lib/types";
import { CloseupTableau } from "./CloseupTableau";
import { EmailGate } from "./EmailGate";
import { FondPicker } from "./FondPicker";
import { LifestyleCarousel } from "./LifestyleCarousel";
import { PdfPack } from "./PdfPack";
import { SiteFooter } from "./SiteFooter";
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

export function VerseApp({ locale = "fr" }: { locale?: Locale }) {
  const copy = getCopy(locale);
  const [bible, setBible] = useState<Bible | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<DraftPick>(DEFAULT_PICK);
  const [sizeId, setSizeId] = useState(DEFAULT_SIZE_ID);
  const [palette, setPalette] = useState<BackgroundId>(DEFAULT_BACKGROUND);
  const [paidTicket, setPaidTicket] = useState<string | null>(null);
  const [ownedTickets, setOwnedTickets] = useState<string[]>([]);
  const [payError, setPayError] = useState<string | null>(null);
  const printSize = getPrintSize(sizeId);
  const verticalSize = getOrientedSize(printSize, "vertical");
  const horizontalSize = getOrientedSize(printSize, "horizontal");

  useEffect(() => {
    let cancelled = false;
    loadBible(locale)
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
          setError(cause instanceof Error ? cause.message : copy.loadError);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [copy.loadError, locale]);

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
      (!PAYWALL_ENABLED ||
        (paidTicket && ticketUnlocks(paidTicket, liveChoice)) ||
        ownedTickets.some((ticket) => ticketUnlocks(ticket, liveChoice))),
  );

  useEffect(() => {
    document.body.classList.toggle("is-paid", isPaid);
    return () => document.body.classList.remove("is-paid");
  }, [isPaid]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("cancel") === "1") {
      window.history.replaceState({}, "", window.location.pathname);
      queueMicrotask(() => setPayError(copy.payCanceled));
    }

    let cancelled = false;
    const loadOwned = () =>
      fetch("/api/orders")
        .then(async (response) => {
          if (cancelled || response.status === 401) return;
          const data = (await response.json()) as { orders?: { ticket: string }[] };
          setOwnedTickets((data.orders ?? []).map((order) => order.ticket));
        })
        .catch(() => undefined);

    const sessionId = params.get("checkout");
    if (!sessionId) {
      void loadOwned();
      return () => {
        cancelled = true;
      };
    }

    fetch(`/api/checkout/verify?session_id=${encodeURIComponent(sessionId)}`)
      .then((response) => response.json())
      .then((data: { paid?: boolean; ticket?: string | null }) => {
        if (cancelled || !data.paid || !data.ticket) return;
        setPaidTicket(data.ticket);
        window.history.replaceState({}, "", window.location.pathname);
      })
      .catch(() => {
        if (!cancelled) setPayError(copy.payUnverified);
      })
      .finally(() => {
        if (!cancelled) void loadOwned();
      });

    return () => {
      cancelled = true;
    };
  }, [copy.payCanceled, copy.payUnverified]);

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
        <p className="status-message">{copy.loadingBible}</p>
      </main>
    );
  }

  return (
    <div className="app-shell">
      <header className="app-chrome site-header">
        <p className="brand-mark">{copy.brand}</p>
        <div className="header-links">
          <a className="header-meta" href={copy.switchHref}>
            {copy.switchLabel}
          </a>
          <a className="header-meta" href={copy.paths.prints}>
            {copy.printsNav}
          </a>
        </div>
      </header>

      <section className="app-chrome intro">
        <h1>{copy.introTitle}</h1>
        <p>{copy.introLead}</p>
      </section>

      <section className="app-chrome configure">
        <h2>{copy.customize}</h2>
        <div
          className={`toolbar picker ${
            draft.verse != null ? "has-ref" : draft.chapter != null ? "has-chapter" : "book-only"
          }`}
        >
        <label className="field field-grow">
          <span>{copy.book}</span>
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
              {copy.chooseBook}
            </option>
            <optgroup label={copy.oldTestament}>
              {bible.books.map((item, index) =>
                item.testament === "AT" ? (
                  <option key={item.name} value={index}>
                    {item.name}
                  </option>
                ) : null,
              )}
            </optgroup>
            <optgroup label={copy.newTestament}>
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
            <span>{copy.chapter}</span>
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
                {copy.choose}
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
            <span>{copy.verse}</span>
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
                {copy.choose}
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
            <span>{copy.sentence}</span>
            <select
              value={draft.sentence}
              onChange={(event) =>
                updateDraft({
                  ...draft,
                  sentence: Number(event.target.value),
                })
              }
            >
              <option value={0}>{copy.wholeVerse}</option>
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
            <span>{copy.size}</span>
            <select value={sizeId} onChange={(event) => setSizeId(event.target.value)}>
              <optgroup label={copy.vertical}>
                {PRINT_SIZES.filter((size) => size.orientation === "vertical").map((size) => (
                  <option key={size.id} value={size.id}>
                    {formatSizeLabel(size, { vertical: copy.vertical, horizontal: copy.horizontal })}
                  </option>
                ))}
              </optgroup>
              <optgroup label={copy.horizontal}>
                {PRINT_SIZES.filter((size) => size.orientation === "horizontal").map((size) => (
                  <option key={size.id} value={size.id}>
                    {formatSizeLabel(size, { vertical: copy.vertical, horizontal: copy.horizontal })}
                  </option>
                ))}
              </optgroup>
            </select>
          </label>
        ) : null}
        </div>

        <FondPicker value={palette} onChange={setPalette} locale={locale} />

        {!liveChoice ? (
          <p className="hint">
            {draft.book == null
              ? copy.hintBook
              : draft.chapter == null
                ? copy.hintChapter
                : copy.hintVerse}
          </p>
        ) : null}
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
              <p className="buy-kicker">{copy.composition}</p>
              <p className="buy-ref">{reference}</p>
              <p className="buy-price">
                <span>{copy.fulfillment}</span>
              </p>
            </div>
            {isPaid ? (
              <PdfPack
                text={text}
                reference={reference}
                verseRef={liveChoice}
                palette={palette}
                locale={locale}
              />
            ) : (
              <EmailGate
                ticket={printTicket(liveChoice, palette)}
                reference={reference}
                locale={locale}
              />
            )}
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
                label={copy.vertical}
                palette={palette}
                locale={locale}
              />
              <CloseupTableau
                text={text}
                reference={reference}
                verseRef={liveChoice}
                size={horizontalSize}
                finish="gold"
                label={copy.horizontal}
                palette={palette}
                locale={locale}
              />
            </div>
            <LifestyleCarousel
              text={text}
              reference={reference}
              verseRef={liveChoice}
              verticalSize={verticalSize}
              horizontalSize={horizontalSize}
              finish="gold"
              palette={palette}
              locale={locale}
            />
          </div>
          <p className="app-chrome size-caption">{copy.sizeCaption}</p>
          <div className="print-sheet" aria-hidden="true">
            <VerseSheet
              key={`${printSize.id}-${liveChoice.book}-${liveChoice.chapter}-${liveChoice.verse}-${liveChoice.sentence}-${palette}`}
              text={text}
              reference={reference}
              verseRef={liveChoice}
              size={printSize}
              palette={palette}
              locale={locale}
            />
          </div>
        </>
      ) : null}

      <section className="app-chrome faq" aria-label={copy.faqLabel}>
        <h2>{copy.faqTitle}</h2>
        <div className="faq-list">
          {copy.faq.map((item) => (
            <details key={item.q} className="faq-item">
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <SiteFooter extra={`${bible.translation} · ${bible.copyright}`} locale={locale} />
      <p className="print-denied" aria-hidden="true">
        {copy.printDenied}
      </p>
    </div>
  );
}
