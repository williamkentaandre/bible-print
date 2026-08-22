import type { Metadata } from "next";
import { LegalChrome } from "@/components/LegalChrome";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Conditions générales de vente — Bible Deco",
  description: "CGV de Bible Deco : 12 PDF, prix, livraison numérique, rétractation.",
};

export default function Page() {
  return (
    <LegalChrome title="Conditions générales de vente">
      <p>
        Les présentes CGV s’appliquent à toute commande passée sur {LEGAL.siteUrl} par
        un consommateur. En validant le paiement, vous les acceptez.
      </p>
      <h2>1. Objet</h2>
      <p>
        {LEGAL.siteName} vend des fichiers numériques : 12 PDF d’un verset biblique
        choisi, toutes tailles, vertical et horizontal, prêts à faire tirer chez un
        imprimeur. Rien n’est imprimé ni expédié. Le cadre mural des aperçus n’est pas
        fourni.
      </p>
      <h2>2. Prix et paiement</h2>
      <p>
        Le prix est de {LEGAL.price} par verset, TTC (TVA {LEGAL.tva}). Le paiement est
        unique, par carte, via Stripe.
        La commande n’est confirmée qu’après encaissement.
      </p>
      <h2>3. Commande</h2>
      <p>
        Vous choisissez un verset, indiquez votre email, puis payez. Un espace « Mes
        impressions » permet de télécharger les fichiers. Un email avec un lien d’accès
        est envoyé à l’adresse fournie. Sans email valide, la livraison numérique ne
        peut pas être garantie.
      </p>
      <h2>4. Livraison</h2>
      <p>
        Livraison exclusivement numérique, immédiate après paiement : téléchargement
        depuis Mes impressions et lien par email. Aucun envoi postal.
      </p>
      <h2>5. Droit de rétractation</h2>
      <p>
        Conformément à l’article L221-28 13° du Code de la consommation, le droit de
        rétractation ne s’applique pas aux contenus numériques fournis sur un support
        immatériel dont l’exécution a commencé avec votre accord. En lançant le
        téléchargement, vous renoncez à ce droit pour cette commande.
      </p>
      <h2>6. Utilisation des fichiers</h2>
      <p>
        Les PDF sont destinés à un usage personnel (impression et encadrement chez
        vous). Toute revente, diffusion ou usage commercial des fichiers est interdit.
        Le texte Louis Segond 1910 est libre de droits.
      </p>
      <h2>7. Responsabilité</h2>
      <p>
        {LEGAL.siteName} n’est pas responsable de l’impression réalisée par un tiers,
        ni du choix ou de la qualité d’un cadre. En cas de fichier illisible, contactez{" "}
        <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a> : un nouvel
        accès pourra être ouvert.
      </p>
      <h2>8. Réclamations et médiation</h2>
      <p>
        Écrivez à <a href={`mailto:${LEGAL.contactEmail}`}>{LEGAL.contactEmail}</a>.
        Si le litige n’est pas résolu, vous pouvez recourir à un médiateur de la
        consommation, conformément aux articles L611-1 et suivants du Code de la
        consommation, et à la plateforme européenne :{" "}
        <a href="https://ec.europa.eu/consumers/odr">
          ec.europa.eu/consumers/odr
        </a>
        .
      </p>
      <h2>9. Droit applicable</h2>
      <p>Droit français. Tribunaux compétents selon les règles en vigueur.</p>
    </LegalChrome>
  );
}
