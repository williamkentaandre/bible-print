"use client";

import { useState } from "react";
import { getCopy, type Locale } from "@/i18n";
import { PRINT_PRICE_LABEL } from "@/lib/print-ticket";
import { listedPrintFormats } from "@/lib/sizes";

type EmailGateProps = {
  ticket: string;
  reference: string;
  locale?: Locale;
};

function PackContents({ locale }: { locale: Locale }) {
  const copy = getCopy(locale);
  return (
    <div className="pack-contents">
      <p className="pack-lead">{copy.packLead}</p>
      <ul className="pack-sizes">
        {listedPrintFormats().map((size) => (
          <li key={size.inchesLabel}>
            {size.inchesLabel} – {size.metricLabel}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function EmailGate({ ticket, reference, locale = "fr" }: EmailGateProps) {
  const copy = getCopy(locale);
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"email" | "pay">("email");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const emailReady = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const submit = async (intent: "buy" | "login") => {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch("/api/order/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, ticket, reference, intent, locale }),
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
        throw new Error(data.error || copy.continueError);
      }
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      if (data.redirect) {
        window.location.href = data.redirect;
        return;
      }
      setMessage(data.message || copy.checkInbox);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : copy.continueError);
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
          void fetch("/api/contacts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, locale, reference, source: "lead" }),
            keepalive: true,
          });
          return;
        }
        void submit("buy");
      }}
    >
      {step === "email" ? (
        <>
          <label className="field">
            <span>{copy.emailLabel}</span>
            <input
              type="email"
              name="email"
              autoComplete="email"
              required
              placeholder={copy.emailPlaceholder}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>
          {emailReady ? <PackContents locale={locale} /> : <p className="email-hint">{copy.emailHint}</p>}
          <button
            className="print-button validate-button cta-button is-ready"
            type="submit"
            disabled={busy}
          >
            {copy.continue}
          </button>
        </>
      ) : (
        <>
          <p className="pay-step-email">{email}</p>
          <p className="pay-step-price">{PRINT_PRICE_LABEL}</p>
          <PackContents locale={locale} />
          <button className="print-button validate-button cta-button is-ready" type="submit" disabled={busy}>
            {busy ? copy.wait : copy.payDownload}
          </button>
          <p className="email-hint">{copy.payHint}</p>
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
            {copy.changeEmail}
          </button>
        </>
      )}
      <button
        className="text-link"
        type="button"
        disabled={busy}
        onClick={() => void submit("login")}
      >
        {copy.alreadyOrdered}
      </button>
      {message ? <p className="confirm-copy">{message}</p> : null}
      {error ? <p className="field-error">{error}</p> : null}
    </form>
  );
}
