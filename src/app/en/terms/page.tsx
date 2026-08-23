import type { Metadata } from "next";
import { LegalChrome } from "@/components/LegalChrome";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Terms of sale – Bible Deco",
  description: "Bible Deco terms: 12 PDFs, price, digital delivery, withdrawal.",
};

export default function Page() {
  return (
    <LegalChrome title="Terms of sale" locale="en">
      <p>
        These terms apply to every order placed on {LEGAL.siteUrl} by a consumer. By
        completing payment, you accept them. The French version of these terms
        prevails if they differ.
      </p>
      <h2>1. Purpose</h2>
      <p>
        {LEGAL.siteName} sells digital files: 12 PDFs of a chosen Bible verse, every
        size, portrait and landscape, ready to print at a shop. Nothing is printed or
        shipped. The wall frame shown in the previews is not included.
      </p>
      <h2>2. Price and payment</h2>
      <p>
        The price is {LEGAL.price} per verse, including VAT (VAT {LEGAL.tva}). Payment
        is a single card charge via Stripe. The order is confirmed only after
        payment is received.
      </p>
      <h2>3. Order</h2>
      <p>
        You choose a verse, enter your email, then pay. A “My prints” space lets you
        download the files. An email with an access link is sent to the address you
        give. Without a valid email, digital delivery cannot be guaranteed.
      </p>
      <h2>4. Delivery</h2>
      <p>
        Delivery is digital only, immediately after payment: download from My prints
        and a link by email. No postal shipment.
      </p>
      <h2>5. Right of withdrawal</h2>
      <p>
        Under article L221-28 13° of the French Consumer Code, the right of
        withdrawal does not apply to digital content supplied on an intangible medium
        whose performance has begun with your agreement. By starting the download,
        you waive that right for this order.
      </p>
      <h2>6. Commercial guarantee: satisfied or refunded</h2>
      <p>
        Independently of the right of withdrawal, {LEGAL.siteName} offers a
        commercial guarantee: if the files are not right for you, write to{" "}
        <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a>. The order
        is then refunded.
      </p>
      <h2>7. Use of the files</h2>
      <p>
        The PDFs are for personal use (printing and framing at home). Resale,
        distribution or commercial use of the files is forbidden. The King James
        Version text is in the public domain.
      </p>
      <h2>8. Liability</h2>
      <p>
        {LEGAL.siteName} is not responsible for printing done by a third party, nor
        for the choice or quality of a frame. If a file cannot be read, write to{" "}
        <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a>: a new
        access may be opened.
      </p>
      <h2>9. Complaints and mediation</h2>
      <p>
        Write to <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a>.
        If the dispute is not resolved, you may use a consumer mediator under articles
        L611-1 and following of the French Consumer Code, and the European platform:{" "}
        <a href="https://ec.europa.eu/consumers/odr">
          ec.europa.eu/consumers/odr
        </a>
        .
      </p>
      <h2>10. Governing law</h2>
      <p>French law. Competent courts under the rules in force.</p>
    </LegalChrome>
  );
}
