"use client";

import { useEffect, useMemo, useState } from "react";
import {
  clampChoice,
  formatReference,
  getChoiceText,
  loadBible,
} from "@/lib/bible";
import { CONTACT_EMAIL, parseTicket } from "@/lib/print-ticket";
import type { Bible } from "@/lib/types";
import { PdfPack } from "./PdfPack";
import { SiteFooter } from "./SiteFooter";

type OrderRecord = {
  id: string;
  ticket: string;
  reference: string;
  created: number;
};

export function MesImpressions() {
  const [bible, setBible] = useState<Bible | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loginEmail, setLoginEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    void loadBible().then(setBible).catch(() => setError("Chargement impossible."));
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("error") === "lien") {
      setError("Ce lien n’est plus valable. Indiquez votre email.");
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
          if (data.preview) {
            setNotice("Essai sans Stripe : le paiement arrivera après la vérification d’identité.");
          }
        })
        .catch(() => setError("Impossible de charger vos impressions."));

    if (!sessionId) {
      void loadOrders();
      return;
    }

    fetch(`/api/checkout/verify?session_id=${encodeURIComponent(sessionId)}`)
      .then((response) => response.json())
      .then((data: { paid?: boolean }) => {
        window.history.replaceState({}, "", "/mes-impressions");
        if (data.paid) {
          setNotice("Paiement reçu. Vos PDF sont ici, et un email vient de partir.");
        }
      })
      .catch(() => setError("Le paiement n’a pas pu être vérifié."))
      .finally(() => void loadOrders());
  }, []);

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
        body: JSON.stringify({ email: loginEmail, intent: "login" }),
      });
      const data = (await response.json()) as { message?: string; error?: string };
      if (!response.ok) throw new Error(data.error || "Envoi impossible.");
      setNotice(data.message || "Regardez votre boîte mail.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Envoi impossible.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="app-shell">
      <header className="app-chrome site-header">
        <a className="brand-mark" href="/">
          Bible Deco
        </a>
        <a className="header-meta" href="/">
          Retour à l’atelier
        </a>
      </header>

      <section className="app-chrome intro">
        <h1>Mes impressions</h1>
        <p>Retrouvez ici tous les versets que vous avez commandés.</p>
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
          <p>Indiquez l’email utilisé pour payer. On vous envoie un lien, sans mot de passe.</p>
          <label className="field">
            <span>Votre email</span>
            <input
              type="email"
              required
              value={loginEmail}
              onChange={(event) => setLoginEmail(event.target.value)}
            />
          </label>
          <button className="print-button validate-button" type="submit" disabled={busy}>
            {busy ? "Envoi…" : "M’envoyer le lien"}
          </button>
        </form>
      ) : (
        <p className="app-chrome account-email">Connecté : {email}</p>
      )}

      {email && rows.length === 0 ? (
        <p className="app-chrome hint">Aucune commande pour le moment.</p>
      ) : null}

      {rows.map((row) => (
        <article key={row.id} className="app-chrome order-card">
          <div className="buy-copy">
            <p className="buy-kicker">
              {new Date(row.created * 1000).toLocaleDateString("fr-FR")}
            </p>
            <p className="buy-ref">{row.reference}</p>
          </div>
          <PdfPack text={row.text} reference={row.reference} verseRef={row.verseRef} />
        </article>
      ))}

      <SiteFooter extra={`Une question ? ${CONTACT_EMAIL}`} />
    </div>
  );
}
