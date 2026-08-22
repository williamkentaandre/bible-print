"use client";

import { useState } from "react";
import { PRINT_OFFER_LABEL, PRINT_PRICE_LABEL } from "@/lib/print-ticket";

type EmailGateProps = {
  ticket: string;
  reference: string;
};

export function EmailGate({ ticket, reference }: EmailGateProps) {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"email" | "pay">("email");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async (intent: "buy" | "login") => {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch("/api/order/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, ticket, reference, intent }),
      });
      const data = (await response.json()) as {
        url?: string;
        redirect?: string;
        sent?: boolean;
        alreadyPaid?: boolean;
        message?: string;
        error?: string;
      };
      if (!response.ok) {
        throw new Error(data.error || "Impossible de continuer.");
      }
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      if (data.redirect) {
        window.location.href = data.redirect;
        return;
      }
      setMessage(data.message || "Regardez votre boîte mail.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Impossible de continuer.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      className="email-gate"
      onSubmit={(event) => {
        event.preventDefault();
        if (step === "email") {
          setError(null);
          setMessage(null);
          setStep("pay");
          return;
        }
        void submit("buy");
      }}
    >
      {step === "email" ? (
        <>
          <label className="field">
            <span>Votre email</span>
            <input
              type="email"
              name="email"
              autoComplete="email"
              required
              placeholder="vous@email.fr"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          <button className="print-button validate-button" type="submit" disabled={busy}>
            Continuer
          </button>
          <p className="email-hint">Pour recevoir vos fichiers si vous téléchargez.</p>
        </>
      ) : (
        <>
          <p className="pay-step-email">{email}</p>
          <p className="pay-step-price">
            {PRINT_PRICE_LABEL} <span>{PRINT_OFFER_LABEL}</span>
          </p>
          <button className="print-button validate-button" type="submit" disabled={busy}>
            {busy ? "Un instant…" : "Payer et télécharger"}
          </button>
          <p className="email-hint">Paiement unique, puis les PDF dans Mes impressions.</p>
          <button
            className="text-link"
            type="button"
            disabled={busy}
            onClick={() => {
              setStep("email");
              setError(null);
              setMessage(null);
            }}
          >
            Modifier l’email
          </button>
        </>
      )}
      <button
        className="text-link"
        type="button"
        disabled={busy}
        onClick={() => void submit("login")}
      >
        J’ai déjà commandé
      </button>
      {message ? <p className="confirm-copy">{message}</p> : null}
      {error ? <p className="field-error">{error}</p> : null}
    </form>
  );
}
