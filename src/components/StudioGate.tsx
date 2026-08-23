"use client";

import { useEffect, useRef, useState } from "react";

export function StudioGate() {
  const [secret, setSecret] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const triedQuery = useRef(false);

  const submit = async (value: string) => {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/studio/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret: value }),
      });
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        setError(data.error || "Accès refusé.");
        setBusy(false);
        return;
      }
      window.location.replace("/studio");
    } catch {
      setError("Impossible de vérifier l’accès.");
      setBusy(false);
    }
  };

  useEffect(() => {
    if (triedQuery.current) return;
    triedQuery.current = true;
    const given = new URLSearchParams(window.location.search).get("secret");
    if (given) void submit(given);
  }, []);

  return (
    <main className="studio-shell studio-gate">
      <p className="brand-mark">Bible Deco</p>
      <h1>Studio épingles</h1>
      <p>Espace privé pour transformer un verset en photo, prête à épingler.</p>
      <form
        className="studio-gate-form"
        onSubmit={(event) => {
          event.preventDefault();
          void submit(secret);
        }}
      >
        <label className="field">
          <span className="field-legend">Mot de passe</span>
          <input
            type="password"
            name="secret"
            autoComplete="current-password"
            value={secret}
            onChange={(event) => setSecret(event.target.value)}
            required
          />
        </label>
        <button className="print-button cta-button" type="submit" disabled={busy || !secret}>
          {busy ? "Vérification…" : "Entrer"}
        </button>
        {error ? <p className="field-error">{error}</p> : null}
      </form>
    </main>
  );
}
