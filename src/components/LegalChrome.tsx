import type { ReactNode } from "react";
import { getCopy, type Locale } from "@/i18n";
import { SiteFooter } from "./SiteFooter";

type LegalChromeProps = {
  title: string;
  children: ReactNode;
  locale?: Locale;
};

export function LegalChrome({ title, children, locale = "fr" }: LegalChromeProps) {
  const copy = getCopy(locale);
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
      <article className="app-chrome legal">
        <h1>{title}</h1>
        {children}
      </article>
      <SiteFooter locale={locale} />
    </div>
  );
}
