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
import {
  PAYWALL_ENABLED,
  printTicket,
  ticketUnlocks,
  PRINT_FULFILLMENT_LABEL,
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

export function VerseApp() {
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
      queueMicrotask(() => setPayError("Paiement annulé."));
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
        if (!cancelled) setPayError("Le paiement n’a pas pu être vérifié.");
      })
      .finally(() => {
        if (!cancelled) void loadOwned();
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
        <p className="brand-mark">Bible Deco</p>
        <a className="header-meta" href="/mes-impressions">
          Mes impressions
        </a>
      </header>

      <section className="app-chrome intro">
        <h1>Le verset que vous aimez, accroché chez vous.</h1>
        <p>
          Calligraphie soignée, filet doré. Vous voyez déjà le rendu dans la pièce.
        </p>
      </section>

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

        <FondPicker value={palette} onChange={setPalette} />

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
                <span>{PRINT_FULFILLMENT_LABEL}</span>
              </p>
            </div>
            {isPaid ? (
              <PdfPack text={text} reference={reference} verseRef={liveChoice} palette={palette} />
            ) : (
              <EmailGate ticket={printTicket(liveChoice, palette)} reference={reference} />
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
                label="Vertical"
                palette={palette}
              />
              <CloseupTableau
                text={text}
                reference={reference}
                verseRef={liveChoice}
                size={horizontalSize}
                finish="gold"
                label="Horizontal"
                palette={palette}
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
            />
          </div>
          <p className="app-chrome size-caption">
            Vertical et horizontal, tels qu’ils peuvent habiter le salon et la chambre.
          </p>
          <div className="print-sheet" aria-hidden="true">
            <VerseSheet
              key={`${printSize.id}-${liveChoice.book}-${liveChoice.chapter}-${liveChoice.verse}-${liveChoice.sentence}-${palette}`}
              text={text}
              reference={reference}
              verseRef={liveChoice}
              size={printSize}
              palette={palette}
            />
          </div>
        </>
      ) : null}

      <section className="app-chrome faq" aria-label="Questions fréquentes">
        <h2>Questions</h2>
        <div className="faq-list">
          <details className="faq-item">
            <summary>Vous envoyez une affiche ?</summary>
            <p>
              Non. Rien n’est imprimé ni expédié. Vous téléchargez les PDF, puis vous
              faites tirer le format choisi chez un imprimeur.
            </p>
          </details>
          <details className="faq-item">
            <summary>Comment je l’imprime ?</summary>
            <p>
              Chez n’importe quel imprimeur : boutique photo, copyshop, grand magasin.
              Donnez le PDF du format que vous voulez accrocher.
            </p>
          </details>
          <details className="faq-item">
            <summary>Et le cadre ?</summary>
            <p>
              Les tailles sont courantes. Une fois la feuille tirée, un cadre aux bonnes
              dimensions se trouve facilement.
            </p>
          </details>
          <details className="faq-item">
            <summary>Comment je retrouve mes fichiers ?</summary>
            <p>
              Après le paiement, un email vous emmène vers Mes impressions. Vous pouvez
              aussi y revenir depuis le haut de page, avec le même email.
            </p>
          </details>
          <details className="faq-item">
            <summary>Que contiennent les fichiers ?</summary>
            <p>
              Les 12 PDF de votre verset : toutes les tailles, vertical et horizontal,
              avec le fond choisi.
            </p>
          </details>
          <details className="faq-item">
            <summary>Puis-je changer le fond ?</summary>
            <p>
              Oui. Quatre papiers classiques, et quatre fonds plus singuliers : lin,
              champagne, sauge, encre.
            </p>
          </details>
          <details className="faq-item">
            <summary>Le texte est-il fidèle ?</summary>
            <p>
              Oui. Louis Segond 1910, domaine public. Vous pouvez aussi choisir
              n’importe quel autre verset avant de télécharger.
            </p>
          </details>
          <details className="faq-item">
            <summary>Le cadre des photos est-il fourni ?</summary>
            <p>
              Non. Le double filet doré est dans le PDF. Le cadre mural des photos
              d’intérieur n’est qu’un aperçu, pour voir le verset chez vous.
            </p>
          </details>
        </div>
      </section>

      <SiteFooter extra={`${bible.translation} · ${bible.copyright}`} />
      <p className="print-denied" aria-hidden="true">
        Téléchargez les PDF depuis le bouton, plutôt que d’imprimer cette page.
      </p>
    </div>
  );
}
