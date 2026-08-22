import { CONTACT_EMAIL } from "@/lib/print-ticket";

type SiteFooterProps = {
  extra?: string;
};

export function SiteFooter({ extra }: SiteFooterProps) {
  return (
    <footer className="app-chrome site-footer">
      <ul className="trust-row">
        <li>Paiement sécurisé</li>
        <li>Calligraphie soignée</li>
        <li>Louis Segond 1910</li>
      </ul>
      <nav className="legal-nav" aria-label="Informations légales">
        <a href="/mentions-legales">Mentions légales</a>
        <a href="/cgv">CGV</a>
        <a href="/confidentialite">Confidentialité</a>
      </nav>
      <p className="footnote">
        {extra ? `${extra} · ` : null}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
      </p>
    </footer>
  );
}
