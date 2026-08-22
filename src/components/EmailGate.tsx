"use client";

import { useState } from "react";

type EmailGateProps = {
  ticket: string;
  reference: string;
};

export function EmailGate({ ticket, reference }: EmailGateProps) {
  const [email, setEmail] = useState("");
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
        void submit("buy");
      }}
    >
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
        {busy ? "Un instant…" : "Recevoir mes PDF"}
      </button>
      <p className="email-hint">
        On vous envoie le lien vers vos fichiers.
      </p>
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
