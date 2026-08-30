"use client";

import { useState } from "react";
import { getCopy, type Locale } from "@/i18n";
import { listedPrintFormats } from "@/lib/sizes";

type FreeEmailGateProps = {
  ticket: string;
  reference: string;
  locale?: Locale;
  onUnlocked: (message?: string) => void;
};

function PackContents({ locale }: { locale: Locale }) {
  const copy = getCopy(locale);
  return (
    <div className="pack-contents">
      <p className="pack-lead">{copy.packLead}</p>
      <ul className="pack-sizes">
        {listedPrintFormats().map((size) => (
          <li key={size.inchesLabel}>
            {size.inchesLabel} - {size.metricLabel}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function FreeEmailGate({
  ticket,
  reference,
  locale = "fr",
  onUnlocked,
}: FreeEmailGateProps) {
  const copy = getCopy(locale);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const emailReady = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/download/free", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, ticket, reference, locale }),
      });
      const data = (await response.json()) as {
        ok?: boolean;
        sent?: boolean;
        message?: string;
        error?: string;
      };
      if (!response.ok) {
        throw new Error(data.error || copy.continueError);
      }
      onUnlocked(data.message || copy.freeDownloadSent);
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
        void submit();
      }}
    >
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
      {emailReady ? <PackContents locale={locale} /> : <p className="email-hint">{copy.freeEmailHint}</p>}
      <button className="print-button validate-button cta-button is-ready" type="submit" disabled={busy}>
        {busy ? copy.wait : copy.freeDownload}
      </button>
      {error ? <p className="field-error">{error}</p> : null}
    </form>
  );
}
