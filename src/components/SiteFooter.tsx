import { getCopy, type Locale } from "@/i18n";
import { CONTACT_EMAIL } from "@/lib/print-ticket";

type SiteFooterProps = {
  extra?: string;
  locale?: Locale;
};

export function SiteFooter({ extra, locale = "fr" }: SiteFooterProps) {
  const copy = getCopy(locale);
  return (
    <footer className="app-chrome site-footer">
      <ul className="trust-row">
        <li>{copy.trustGuarantee}</li>
        <li>{copy.trustReady}</li>
        <li>{copy.trustCalligraphy}</li>
        <li>{copy.trustTranslation}</li>
      </ul>
      <nav className="legal-nav" aria-label={copy.legalNavLabel}>
        <a href={copy.paths.legal}>{copy.legalMentions}</a>
        <a href={copy.paths.terms}>{copy.legalTerms}</a>
        <a href={copy.paths.privacy}>{copy.legalPrivacy}</a>
      </nav>
      <p className="footnote">
        {extra ? `${extra} · ` : null}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
      </p>
    </footer>
  );
}
