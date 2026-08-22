"use client";

import { useEffect, useMemo, useState } from "react";
import { getCopy, type Locale } from "@/i18n";
import {
  clampChoice,
  formatReference,
  getChoiceText,
  loadBible,
} from "@/lib/bible";
import { CONTACT_EMAIL, parseTicket, parseTicketPalette } from "@/lib/print-ticket";
import type { Bible } from "@/lib/types";
import { PdfPack } from "./PdfPack";
import { SiteFooter } from "./SiteFooter";

type OrderRecord = {
  id: string;
  ticket: string;
  reference: string;
  created: number;
};

export function MesImpressions({ locale = "fr" }: { locale?: Locale }) {
  const copy = getCopy(locale);
  const [bible, setBible] = useState<Bible | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loginEmail, setLoginEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    void loadBible(locale).then(setBible).catch(() => setError(copy.loadError));
  }, [copy.loadError, locale]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("error") === "lien") {
      setError(copy.magicExpired);
    }

    const sessionId = params.get("checkout");
    const loadOrders = () =>
      fetch("/api/orders")
        .then(async (response) => {
          if (response.status === 401) {
            setEmail(null);
            setOrders([]);
            return;
          }
          const data = (await response.json()) as {
            email?: string;
            orders?: OrderRecord[];
            preview?: boolean;
          };
          setEmail(data.email ?? null);
          setOrders(data.orders ?? []);
        })
        .catch(() => setError(copy.loadOrdersError));

    if (!sessionId) {
      void loadOrders();
      return;
    }

    fetch(`/api/checkout/verify?session_id=${encodeURIComponent(sessionId)}`)
      .then((response) => response.json())
      .then((data: { paid?: boolean }) => {
        window.history.replaceState({}, "", copy.paths.prints);
        if (data.paid) {
          setNotice(copy.paidNotice);
        }
      })
      .catch(() => setError(copy.payUnverified))
      .finally(() => void loadOrders());
  }, [copy.loadOrdersError, copy.magicExpired, copy.paidNotice, copy.paths.prints, copy.payUnverified]);

  const rows = useMemo(() => {
    if (!bible) return [];
    return orders.flatMap((order) => {
      const parsed = parseTicket(order.ticket);
      if (!parsed) return [];
      const verseRef = clampChoice(bible.books, parsed);
      return [
        {
          ...order,
          verseRef,
          text: getChoiceText(bible.books, verseRef),
          reference: formatReference(bible.books, verseRef) || order.reference,
        },
      ];
    });
  }, [bible, orders]);

  const sendLogin = async () => {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/order/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, intent: "login", locale }),
      });
      const data = (await response.json()) as { message?: string; error?: string };
      if (!response.ok) throw new Error(data.error || copy.sendError);
      setNotice(data.message || copy.checkInbox);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : copy.sendError);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="app-shell">
      <header className="app-chrome site-header">
        <a className="brand-mark" href={copy.paths.home}>
          {copy.brand}
        </a>
        <div className="header-links">
          <a className="header-meta" href={copy.switchHref}>
            {copy.switchLabel}
          </a>
          <a className="header-meta" href={copy.paths.home}>
            {copy.backHome}
          </a>
        </div>
      </header>

      <section className="app-chrome intro">
        <h1>{copy.printsTitle}</h1>
        <p>{copy.printsLead}</p>
      </section>

      {notice ? <p className="app-chrome confirm-copy">{notice}</p> : null}
      {error ? <p className="app-chrome field-error">{error}</p> : null}

      {!email ? (
        <form
          className="app-chrome account-box"
          onSubmit={(event) => {
            event.preventDefault();
            void sendLogin();
          }}
        >
          <p>{copy.loginLead}</p>
          <label className="field">
            <span>{copy.emailLabel}</span>
            <input
              type="email"
              required
              value={loginEmail}
              onChange={(event) => setLoginEmail(event.target.value)}
            />
          </label>
          <button className="print-button validate-button" type="submit" disabled={busy}>
            {busy ? copy.sending : copy.sendLink}
          </button>
        </form>
      ) : (
        <p className="app-chrome account-email">
          {copy.connected} : {email}
        </p>
      )}

      {email && rows.length === 0 ? (
        <p className="app-chrome hint">{copy.noOrders}</p>
      ) : null}

      {rows.map((row) => (
        <article key={row.id} className="app-chrome order-card">
          <div className="buy-copy">
            <p className="buy-kicker">
              {new Date(row.created * 1000).toLocaleDateString(copy.dateLocale)}
            </p>
            <p className="buy-ref">{row.reference}</p>
          </div>
          <PdfPack
            text={row.text}
            reference={row.reference}
            verseRef={row.verseRef}
            palette={parseTicketPalette(row.ticket)}
            locale={locale}
          />
        </article>
      ))}

      <SiteFooter extra={`${copy.questionLead} ${CONTACT_EMAIL}`} locale={locale} />
    </div>
  );
}
