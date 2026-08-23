import type { Metadata } from "next";
import { LegalChrome } from "@/components/LegalChrome";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Privacy policy - Bible Deco",
  description: "Data collected by Bible Deco: email, payment, necessary cookies.",
};

export default function Page() {
  return (
    <LegalChrome title="Privacy policy" locale="en">
      <p>
        {LEGAL.siteName} processes your data to deliver your order and answer your
        messages. Controller: {LEGAL.editorName}, {LEGAL.editorAddress}. Contact:{" "}
        <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a>.
      </p>
      <h2>Data collected</h2>
      <ul>
        <li>Email, to create the My prints space, send the download link, and keep a contact if we need to write to you about the service.</li>
        <li>The verse ordered and purchase history, so you can find your files.</li>
        <li>
          Payment data processed by Stripe. {LEGAL.siteName} does not store your card
          number.
        </li>
        <li>Messages you send to {LEGAL.contactEmail}.</li>
      </ul>
      <h2>Purposes and legal basis</h2>
      <p>
        Performance of the contract (deliver the PDFs, access to My prints),
        legitimate interest (account security, fraud prevention, customer relationship)
        and legal obligation (invoicing, accounts). The list is not sold. You may ask
        for your email to be deleted at any time.
      </p>
      <h2>Recipients</h2>
      <ul>
        <li>Stripe, for payment.</li>
        <li>Resend, for transactional emails.</li>
        <li>{LEGAL.hostName}, for website hosting and the contacts database.</li>
      </ul>
      <p>
        These providers may be located outside the European Union. Appropriate
        safeguards (standard contractual clauses) are provided in their terms.
      </p>
      <h2>Retention</h2>
      <p>
        Email is kept in an internal database for the service and customer
        relationship, until a deletion request. Orders are also kept for accounting
        duties (in principle 10 years for sales records). Session cookies last at most
        30 days.
      </p>
      <h2>Cookies</h2>
      <p>
        Only strictly necessary cookies are used: the sign-in session for My prints
        and, if Stripe is temporarily unavailable, a trial reminder. No advertising,
        no third-party analytics.
      </p>
      <h2>Your rights</h2>
      <p>
        You may request access, rectification, erasure, restriction or portability of
        your data, and object to certain processing, within the limits of the GDPR.
        Write to <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a>.
        You may also contact the CNIL ({" "}
        <a href="https://www.cnil.fr">cnil.fr</a>).
      </p>
      <p>In case of conflict, the French privacy policy prevails.</p>
    </LegalChrome>
  );
}
