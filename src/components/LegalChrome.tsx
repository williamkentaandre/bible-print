import type { ReactNode } from "react";
import { SiteFooter } from "./SiteFooter";

type LegalChromeProps = {
  title: string;
  children: ReactNode;
};

export function LegalChrome({ title, children }: LegalChromeProps) {
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
      <article className="app-chrome legal">
        <h1>{title}</h1>
        {children}
      </article>
      <SiteFooter />
    </div>
  );
}
