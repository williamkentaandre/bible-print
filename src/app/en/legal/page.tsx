import type { Metadata } from "next";
import { LegalChrome } from "@/components/LegalChrome";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Legal notice – Bible Deco",
  description: "Publisher, host and contact for Bible Deco.",
};

export default function Page() {
  return (
    <LegalChrome title="Legal notice" locale="en">
      <h2>Publisher</h2>
      <p>
        {LEGAL.siteName} – {LEGAL.siteUrl}
        <br />
        {LEGAL.editorName}
        <br />
        {LEGAL.editorStatus} (sole trader)
        <br />
        {LEGAL.editorAddress}
        <br />
        SIREN: {LEGAL.siren}
        <br />
        SIRET: {LEGAL.siret}
        <br />
        {LEGAL.rcs}
        <br />
        VAT no.: {LEGAL.tva}
      </p>
      <h2>Publication director</h2>
      <p>{LEGAL.publicationDirector}</p>
      <h2>Contact</h2>
      <p>
        <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a>
      </p>
      <h2>Hosting</h2>
      <p>
        {LEGAL.hostName}
        <br />
        {LEGAL.hostAddress}
        <br />
        <a href={LEGAL.hostUrl}>{LEGAL.hostUrl}</a>
      </p>
      <h2>Intellectual property</h2>
      <p>
        The layout, calligraphy and the {LEGAL.siteName} website are protected. The
        English biblical text is the King James Version, in the public domain. Any
        reproduction of the site beyond personal use of purchased files is forbidden.
      </p>
      <p>In case of conflict, the French legal notice prevails.</p>
    </LegalChrome>
  );
}
