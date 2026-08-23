import type { Metadata } from "next";
import { LegalChrome } from "@/components/LegalChrome";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Politique de confidentialité – Bible Deco",
  description: "Données collectées par Bible Deco : email, paiement, cookies nécessaires.",
};

export default function Page() {
  return (
    <LegalChrome title="Politique de confidentialité">
      <p>
        {LEGAL.siteName} traite vos données pour livrer votre commande et répondre à
        vos messages. Responsable : {LEGAL.editorName}, {LEGAL.editorAddress}.
        Contact : <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a>.
      </p>
      <h2>Données collectées</h2>
      <ul>
        <li>Email, pour créer l’espace Mes impressions et envoyer le lien de téléchargement.</li>
        <li>Verset commandé et historique d’achat, pour retrouver vos fichiers.</li>
        <li>
          Données de paiement traitées par Stripe. {LEGAL.siteName} ne stocke pas votre
          numéro de carte.
        </li>
        <li>Messages que vous envoyez à {LEGAL.contactEmail}.</li>
      </ul>
      <h2>Finalités et base légale</h2>
      <p>
        Exécution du contrat (livrer les PDF, accès à Mes impressions), intérêt légitime
        (sécurité du compte, prévention de la fraude) et obligation légale (facturation,
        comptabilité). Aucune prospection n’est envoyée sans votre accord.
      </p>
      <h2>Destinataires</h2>
      <ul>
        <li>Stripe, pour le paiement.</li>
        <li>Resend, pour l’envoi des emails transactionnels.</li>
        <li>{LEGAL.hostName}, pour l’hébergement du site.</li>
      </ul>
      <p>
        Ces prestataires peuvent être situés hors de l’Union européenne. Des garanties
        adaptées (clauses types) sont prévues par leurs conditions.
      </p>
      <h2>Durée de conservation</h2>
      <p>
        L’email et les commandes sont conservés le temps nécessaire au service et aux
        obligations comptables (en principe 10 ans pour les pièces de vente). Les
        cookies de session durent au plus 30 jours.
      </p>
      <h2>Cookies</h2>
      <p>
        Seuls des cookies strictement nécessaires sont utilisés : session de connexion
        à Mes impressions, et, en l’absence temporaire de Stripe, mémorisation d’un
        essai. Pas de publicité, pas de mesure d’audience tierce.
      </p>
      <h2>Vos droits</h2>
      <p>
        Vous pouvez demander l’accès, la rectification, l’effacement, la limitation ou
        la portabilité de vos données, et vous opposer à certains traitements, dans les
        limites prévues par le RGPD. Écrivez à{" "}
        <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a>. Vous pouvez
        aussi saisir la CNIL ({" "}
        <a href="https://www.cnil.fr">cnil.fr</a>).
      </p>
    </LegalChrome>
  );
}
