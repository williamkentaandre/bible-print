import type { Metadata } from "next";
import { LegalChrome } from "@/components/LegalChrome";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Mentions légales — Bible Deco",
  description: "Éditeur, hébergeur et contact de Bible Deco.",
};

export default function Page() {
  return (
    <LegalChrome title="Mentions légales">
      <p className="legal-note">
        Les mentions entre crochets doivent être remplies avant d’encaisser.
      </p>
      <h2>Éditeur</h2>
      <p>
        {LEGAL.siteName} — {LEGAL.siteUrl}
        <br />
        {LEGAL.editorName}
        <br />
        {LEGAL.editorStatus}
        <br />
        {LEGAL.editorAddress}
        <br />
        SIRET : {LEGAL.siret}
        <br />
        {LEGAL.tva}
      </p>
      <h2>Directeur de la publication</h2>
      <p>{LEGAL.publicationDirector}</p>
      <h2>Contact</h2>
      <p>
        <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a>
      </p>
      <h2>Hébergement</h2>
      <p>
        {LEGAL.hostName}
        <br />
        {LEGAL.hostAddress}
        <br />
        <a href={LEGAL.hostUrl}>{LEGAL.hostUrl}</a>
      </p>
      <h2>Propriété intellectuelle</h2>
      <p>
        La mise en page, la calligraphie et le site {LEGAL.siteName} sont protégés.
        Le texte biblique proposé est la traduction Louis Segond 1910, tombée dans le
        domaine public. Toute reproduction du site hors usage personnel des fichiers
        achetés est interdite.
      </p>
    </LegalChrome>
  );
}
