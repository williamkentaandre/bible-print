export type Locale = "fr" | "en";

export type AppCopy = {
  locale: Locale;
  htmlLang: string;
  dateLocale: string;
  paths: {
    home: string;
    prints: string;
    legal: string;
    terms: string;
    privacy: string;
  };
  switchLabel: string;
  switchHref: string;
  meta: {
    title: string;
    description: string;
    ogDescription: string;
    ogAlt: string;
  };
  brand: string;
  printsNav: string;
  backHome: string;
  introTitle: string;
  introQuote: string;
  introCite: string;
  introLead: string;
  customize: string;
  pickPath: string;
  book: string;
  chooseBook: string;
  oldTestament: string;
  newTestament: string;
  chapter: string;
  verse: string;
  choose: string;
  chooseChapter: string;
  chooseVerse: string;
  waitBook: string;
  waitChapter: string;
  sentence: string;
  wholeVerse: string;
  size: string;
  vertical: string;
  horizontal: string;
  hintBook: string;
  hintChapter: string;
  hintVerse: string;
  composition: string;
  fulfillment: string;
  offer: string;
  faqTitle: string;
  faqLabel: string;
  faq: { q: string; a: string }[];
  voicesTitle: string;
  voicesLabel: string;
  voicesGuarantee: string;
  voicesGuaranteeLead: string;
  voicesGuaranteeEnd: string;
  starsLabel: string;
  voices: { name: string; quote: string; featured?: boolean }[];
  printDenied: string;
  loadingBible: string;
  loadError: string;
  payCanceled: string;
  payUnverified: string;
  lifestyleLabel: string;
  sceneSalon: string;
  sceneChambre: string;
  zoomIn: string;
  zoomOut: string;
  zoomLabel: string;
  trustGuarantee: string;
  trustReady: string;
  trustCalligraphy: string;
  trustTranslation: string;
  legalNavLabel: string;
  legalMentions: string;
  legalTerms: string;
  legalPrivacy: string;
  fondLabel: string;
  fondHint: string;
  fondClassical: string;
  fondOriginal: string;
  fondNames: Record<string, string>;
  emailLabel: string;
  emailPlaceholder: string;
  continue: string;
  emailHint: string;
  packLead: string;
  payDownload: string;
  wait: string;
  payHint: string;
  changeEmail: string;
  alreadyOrdered: string;
  checkInbox: string;
  continueError: string;
  printsTitle: string;
  printsLead: string;
  loginLead: string;
  sendLink: string;
  sending: string;
  connected: string;
  noOrders: string;
  questionLead: string;
  download: string;
  preparing: string;
  downloadError: string;
  magicExpired: string;
  loadOrdersError: string;
  paidNotice: string;
  sendError: string;
  api: {
    badRequest: string;
    badEmail: string;
    noOrders: string;
    linkSent: string;
    emailNotConfigured: string;
    verseFallback: string;
    badSelection: string;
    alreadyYoursSent: string;
    alreadyYoursOpen: string;
    payClosed: string;
    payImpossible: string;
  };
  mail: {
    readySubject: string;
    readyTitle: string;
    readyBody: (reference: string) => string;
    readyCta: string;
    readyFooter: string;
    loginSubject: string;
    loginTitle: string;
    loginBody: string;
    loginCta: string;
    loginFooter: string;
  };
};

const fr: AppCopy = {
  locale: "fr",
  htmlLang: "fr",
  dateLocale: "fr-FR",
  paths: {
    home: "/",
    prints: "/mes-impressions",
    legal: "/mentions-legales",
    terms: "/cgv",
    privacy: "/confidentialite",
  },
  switchLabel: "EN",
  switchHref: "/en",
  meta: {
    title: "Bible Deco",
    description:
      "Choisissez un verset, voyez-le chez vous, téléchargez 12 PDF prêts à faire tirer.",
    ogDescription: "Le verset que vous aimez, accroché chez vous.",
    ogAlt: "Bible Deco – le verset que vous aimez, accroché chez vous.",
  },
  brand: "Bible Deco",
  printsNav: "Mes impressions",
  backHome: "Retour à l’atelier",
  introTitle: "Le verset que vous aimez, accroché chez vous.",
  introQuote: "Tu les écriras sur les poteaux de ta maison et sur tes portes.",
  introCite: "Deutéronome 6:9",
  introLead:
    "N’importe quel verset de la Bible. Calligraphié, chez vous – pour que la Parole habite la maison, et l’âme.",
  customize: "Votre verset",
  pickPath: "Livre, puis chapitre, puis verset.",
  book: "Livre",
  chooseBook: "Choisir un livre",
  oldTestament: "Ancien Testament",
  newTestament: "Nouveau Testament",
  chapter: "Chapitre",
  verse: "Verset",
  choose: "Choisir",
  chooseChapter: "Choisir le chapitre",
  chooseVerse: "Choisir le verset",
  waitBook: "D’abord le livre",
  waitChapter: "D’abord le chapitre",
  sentence: "Phrase",
  wholeVerse: "Tout le verset",
  size: "Taille",
  vertical: "Vertical",
  horizontal: "Horizontal",
  hintBook: "Choisissez un livre",
  hintChapter: "Choisissez le chapitre",
  hintVerse: "Choisissez le verset",
  composition: "Votre composition",
  fulfillment:
    "12 PDF, toutes tailles. Vous faites tirer le format choisi chez un imprimeur, le cadre se trouve ensuite.",
  offer: "12 PDF, toutes tailles",
  faqTitle: "Questions",
  faqLabel: "Questions fréquentes",
  faq: [
    {
      q: "N’importe quel verset ?",
      a: "Oui. Toute la Bible, de la Genèse à l’Apocalypse. Celui que vous accrochez habite la maison – et l’âme.",
    },
    {
      q: "Recevrai-je une affiche ?",
      a: "Non. Rien n’est imprimé ni expédié. Vous téléchargez les PDF, puis vous faites tirer le format choisi chez un imprimeur.",
    },
    {
      q: "Comment je l’imprime ?",
      a: "Chez n’importe quel imprimeur : boutique photo, copyshop, grand magasin. Donnez le PDF du format que vous voulez accrocher.",
    },
    {
      q: "Et le cadre ?",
      a: "Les tailles sont courantes. Une fois la feuille tirée, un cadre aux bonnes dimensions se trouve facilement.",
    },
    {
      q: "Comment je retrouve mes fichiers ?",
      a: "Après le paiement, un email vous emmène vers Mes impressions. Vous pouvez aussi y revenir depuis le haut de page, avec le même email.",
    },
    {
      q: "Que contiennent les fichiers ?",
      a: "Les 12 PDF de votre verset : toutes les tailles, vertical et horizontal, avec le fond choisi.",
    },
    {
      q: "Puis-je changer le fond ?",
      a: "Oui. Quatre papiers classiques, et quatre fonds plus singuliers : lin, champagne, sauge, encre.",
    },
    {
      q: "Le texte est-il fidèle ?",
      a: "Oui. Louis Segond 1910, domaine public. Vous pouvez aussi choisir n’importe quel autre verset avant de télécharger.",
    },
    {
      q: "Le cadre des photos est-il fourni ?",
      a: "Non. Le double filet doré est dans le PDF. Le cadre mural des photos d’intérieur n’est qu’un aperçu, pour voir le verset chez vous.",
    },
    {
      q: "Satisfait ou remboursé ?",
      a: "Oui. Si les fichiers ne vous conviennent pas, écrivez à contact@bibledeco.com : nous remboursons.",
    },
  ],
  voicesTitle: "Ils en parlent",
  voicesLabel: "Témoignages",
  voicesGuarantee: "Satisfait ou remboursé",
  voicesGuaranteeLead: "Si les fichiers ne vous conviennent pas, écrivez à",
  voicesGuaranteeEnd: " : nous remboursons.",
  starsLabel: "5 étoiles",
  voices: [
    {
      name: "Vanessa",
      featured: true,
      quote: "Si beau. C’est exactement ce que j’attendais.",
    },
    {
      name: "Jean-Sébastien",
      quote: "Exactement ce que je demandais. Un travail soigné, livré comme il faut.",
    },
    {
      name: "Jonathan",
      quote: "Je recommande. C’est mieux.",
    },
    {
      name: "Junior",
      quote: "Super utile.",
    },
    {
      name: "Jeremie",
      quote: "Très fonctionnel et pratique. Je recommande.",
    },
    {
      name: "Hattori",
      quote: "Très bon article. Pratique. À recommander.",
    },
    {
      name: "Benoit",
      quote:
        "Cet achat est une réussite. Très clair. J’avais autre chose avant, un peu compliqué. Ici, tout est limpide. Je recommande.",
    },
    {
      name: "Glgpfm",
      quote:
        "Enfin quelque chose de simple, et si efficace en même temps. Une vision claire, pour avancer vraiment. Un grand merci. Le prix est ridicule au regard de la valeur.",
    },
  ],
  printDenied: "Téléchargez les PDF depuis le bouton, plutôt que d’imprimer cette page.",
  loadingBible: "Chargement de la Bible…",
  loadError: "Chargement impossible.",
  payCanceled: "Paiement annulé.",
  payUnverified: "Le paiement n’a pas pu être vérifié.",
  lifestyleLabel: "Aperçus du verset dans un intérieur",
  sceneSalon: "Salon",
  sceneChambre: "Chambre",
  zoomIn: "Zoomer",
  zoomOut: "Dézoomer",
  zoomLabel: "Zoom de l’aperçu",
  trustGuarantee: "Satisfait ou remboursé",
  trustReady: "PDF prêts à tirer",
  trustCalligraphy: "Calligraphie soignée",
  trustTranslation: "Louis Segond 1910",
  legalNavLabel: "Informations légales",
  legalMentions: "Mentions légales",
  legalTerms: "CGV",
  legalPrivacy: "Confidentialité",
  fondLabel: "Fond",
  fondHint: "Cliquez ici pour changer de fond.",
  fondClassical: "Classiques",
  fondOriginal: "Originaux",
  fondNames: {
    blanc: "Galerie",
    ivoire: "Ivoire",
    creme: "Crème",
    parchemin: "Parchemin",
    lin: "Lin",
    champagne: "Champagne",
    sauge: "Sauge",
    encre: "Encre",
  },
  emailLabel: "Votre email",
  emailPlaceholder: "vous@email.fr",
  continue: "Continuer",
  emailHint: "Pour recevoir vos fichiers si vous téléchargez.",
  packLead: "Vous recevrez 12 PDF — chaque taille en vertical et en horizontal :",
  payDownload: "Payer et télécharger",
  wait: "Un instant…",
  payHint: "Paiement unique, puis les PDF dans Mes impressions.",
  changeEmail: "Modifier l’email",
  alreadyOrdered: "J’ai déjà commandé",
  checkInbox: "Regardez votre boîte mail.",
  continueError: "Impossible de continuer.",
  printsTitle: "Mes impressions",
  printsLead: "Retrouvez ici tous les versets que vous avez commandés.",
  loginLead: "Indiquez l’email utilisé pour payer. On vous envoie un lien, sans mot de passe.",
  sendLink: "M’envoyer le lien",
  sending: "Envoi…",
  connected: "Connecté",
  noOrders: "Aucune commande pour le moment.",
  questionLead: "Une question ?",
  download: "Télécharger",
  preparing: "Préparation",
  downloadError: "Le téléchargement n’a pas pu être préparé.",
  magicExpired: "Ce lien n’est plus valable. Indiquez votre email.",
  loadOrdersError: "Impossible de charger vos impressions.",
  paidNotice: "Paiement reçu. Vos PDF sont ici, et un email vient de partir.",
  sendError: "Envoi impossible.",
  api: {
    badRequest: "Requête invalide.",
    badEmail: "Indiquez un email valide.",
    noOrders: "Aucune impression à ce nom. Commencez par commander un verset.",
    linkSent: "Un lien a été envoyé. Ouvrez votre boîte mail.",
    emailNotConfigured:
      "Email non configuré. Vérifiez RESEND_API_KEY, ou ouvrez Mes impressions sur ce navigateur.",
    verseFallback: "Verset",
    badSelection: "Sélection invalide.",
    alreadyYoursSent: "Ce verset est déjà à vous. Un lien a été envoyé.",
    alreadyYoursOpen: "Ce verset est déjà à vous. Ouvrez Mes impressions.",
    payClosed: "Le paiement n’est pas encore ouvert. Réessayez dans un instant.",
    payImpossible: "Paiement impossible.",
  },
  mail: {
    readySubject: "Vos impressions sont prêtes",
    readyTitle: "Vos impressions sont prêtes.",
    readyBody: (reference) => `${reference} est dans votre espace. Les 12 PDF vous y attendent.`,
    readyCta: "Ouvrir mes impressions",
    readyFooter: "Une question ? Écrivez-nous à",
    loginSubject: "Votre espace Bible Deco",
    loginTitle: "Retrouvez vos impressions.",
    loginBody: "Cliquez pour ouvrir votre espace. Aucun mot de passe.",
    loginCta: "Ouvrir mes impressions",
    loginFooter: "Une question ?",
  },
};

const en: AppCopy = {
  locale: "en",
  htmlLang: "en",
  dateLocale: "en-GB",
  paths: {
    home: "/en",
    prints: "/en/prints",
    legal: "/en/legal",
    terms: "/en/terms",
    privacy: "/en/privacy",
  },
  switchLabel: "FR",
  switchHref: "/",
  meta: {
    title: "Bible Deco",
    description: "Choose a verse, see it in your home, download 12 print-ready PDFs.",
    ogDescription: "The verse you love, on your wall.",
    ogAlt: "Bible Deco – the verse you love, on your wall.",
  },
  brand: "Bible Deco",
  printsNav: "My prints",
  backHome: "Back to the studio",
  introTitle: "The verse you love, on your wall.",
  introQuote: "And thou shalt write them upon the posts of thy house, and on thy gates.",
  introCite: "Deuteronomy 6:9",
  introLead:
    "Any verse in the Bible. Calligraphed, in your home – so the Word lives in the house, and in the soul.",
  customize: "Your verse",
  pickPath: "Book, then chapter, then verse.",
  book: "Book",
  chooseBook: "Choose a book",
  oldTestament: "Old Testament",
  newTestament: "New Testament",
  chapter: "Chapter",
  verse: "Verse",
  choose: "Choose",
  chooseChapter: "Choose the chapter",
  chooseVerse: "Choose the verse",
  waitBook: "First, the book",
  waitChapter: "First, the chapter",
  sentence: "Sentence",
  wholeVerse: "Whole verse",
  size: "Size",
  vertical: "Portrait",
  horizontal: "Landscape",
  hintBook: "Choose a book",
  hintChapter: "Choose the chapter",
  hintVerse: "Choose the verse",
  composition: "Your piece",
  fulfillment:
    "12 PDFs, every size. You print the format you want at a shop, then find a frame.",
  offer: "12 PDFs, every size",
  faqTitle: "Questions",
  faqLabel: "Frequently asked questions",
  faq: [
    {
      q: "Any verse at all?",
      a: "Yes. The whole Bible, from Genesis to Revelation. The verse you hang lives in the house – and in the soul.",
    },
    {
      q: "Will I receive a poster?",
      a: "No. Nothing is printed or posted. You download the PDFs, then have the format you want printed locally.",
    },
    {
      q: "How do I print it?",
      a: "At any print shop: photo store, copy shop, department store. Give them the PDF for the size you want on the wall.",
    },
    {
      q: "What about the frame?",
      a: "The sizes are standard. Once the sheet is printed, a matching frame is easy to find.",
    },
    {
      q: "How do I find my files again?",
      a: "After payment, an email takes you to My prints. You can also come back from the top of the page, with the same email.",
    },
    {
      q: "What is in the files?",
      a: "The 12 PDFs of your verse: every size, portrait and landscape, with the background you chose.",
    },
    {
      q: "Can I change the background?",
      a: "Yes. Four classic papers, and four more distinctive grounds: linen, champagne, sage, ink.",
    },
    {
      q: "Is the text faithful?",
      a: "Yes. King James Version, public domain. You can also choose any other verse before you download.",
    },
    {
      q: "Is the frame in the photos included?",
      a: "No. The gold double fillet is in the PDF. The wall frame in the room photos is only a preview.",
    },
    {
      q: "Satisfied or refunded?",
      a: "Yes. If the files are not right for you, write to contact@bibledeco.com: we refund.",
    },
  ],
  voicesTitle: "They say",
  voicesLabel: "Testimonials",
  voicesGuarantee: "Satisfied or refunded",
  voicesGuaranteeLead: "If the files are not right for you, write to",
  voicesGuaranteeEnd: ": we refund.",
  starsLabel: "5 stars",
  voices: [
    {
      name: "Vanessa",
      featured: true,
      quote: "So beautiful. The item is exactly what I expected.",
    },
    {
      name: "Jean-Sébastien",
      quote: "Exactly what I asked for. A careful job, delivered as it should be.",
    },
    {
      name: "Jonathan",
      quote: "I recommend it. It is better.",
    },
    {
      name: "Junior",
      quote: "Super useful.",
    },
    {
      name: "Jeremie",
      quote: "Very functional and practical. I recommend.",
    },
    {
      name: "Hattori",
      quote: "Very good. Convenient. Highly recommend.",
    },
    {
      name: "Benoit",
      quote:
        "This purchase is awesome. Very clear. I had something before that was a bit complicated. With this one, everything is lucid. I recommend.",
    },
    {
      name: "Glgpfm",
      quote:
        "Finally something that is simple, and so effective at the same time. A clear view, to move forward with intent. Many thanks. The price is ridiculous considering the added value.",
    },
  ],
  printDenied: "Download the PDFs from the button, rather than printing this page.",
  loadingBible: "Loading the Bible…",
  loadError: "Unable to load.",
  payCanceled: "Payment cancelled.",
  payUnverified: "The payment could not be verified.",
  lifestyleLabel: "The verse previewed in a room",
  sceneSalon: "Living room",
  sceneChambre: "Bedroom",
  zoomIn: "Zoom in",
  zoomOut: "Zoom out",
  zoomLabel: "Preview zoom",
  trustGuarantee: "Satisfied or refunded",
  trustReady: "Print-ready PDFs",
  trustCalligraphy: "Fine calligraphy",
  trustTranslation: "King James Version",
  legalNavLabel: "Legal",
  legalMentions: "Legal notice",
  legalTerms: "Terms",
  legalPrivacy: "Privacy",
  fondLabel: "Background",
  fondHint: "Click here to change the background.",
  fondClassical: "Classic",
  fondOriginal: "Original",
  fondNames: {
    blanc: "Gallery",
    ivoire: "Ivory",
    creme: "Cream",
    parchemin: "Parchment",
    lin: "Linen",
    champagne: "Champagne",
    sauge: "Sage",
    encre: "Ink",
  },
  emailLabel: "Your email",
  emailPlaceholder: "you@email.com",
  continue: "Continue",
  emailHint: "So we can send your files if you download.",
  packLead: "You will receive 12 PDFs — each size in portrait and landscape:",
  payDownload: "Pay and download",
  wait: "One moment…",
  payHint: "One payment, then the PDFs in My prints.",
  changeEmail: "Change email",
  alreadyOrdered: "I already ordered",
  checkInbox: "Check your inbox.",
  continueError: "Unable to continue.",
  printsTitle: "My prints",
  printsLead: "Every verse you have ordered is here.",
  loginLead: "Enter the email you used to pay. We send a link, no password.",
  sendLink: "Send me the link",
  sending: "Sending…",
  connected: "Signed in",
  noOrders: "No orders yet.",
  questionLead: "A question?",
  download: "Download",
  preparing: "Preparing",
  downloadError: "The download could not be prepared.",
  magicExpired: "This link is no longer valid. Enter your email.",
  loadOrdersError: "Unable to load your prints.",
  paidNotice: "Payment received. Your PDFs are here, and an email is on its way.",
  sendError: "Unable to send.",
  api: {
    badRequest: "Invalid request.",
    badEmail: "Please enter a valid email.",
    noOrders: "No prints under that name. Start by ordering a verse.",
    linkSent: "A link has been sent. Open your inbox.",
    emailNotConfigured: "Email is not configured. Open My prints in this browser.",
    verseFallback: "Verse",
    badSelection: "Invalid selection.",
    alreadyYoursSent: "This verse is already yours. A link has been sent.",
    alreadyYoursOpen: "This verse is already yours. Open My prints.",
    payClosed: "Payment is not open yet. Please try again shortly.",
    payImpossible: "Payment could not be started.",
  },
  mail: {
    readySubject: "Your prints are ready",
    readyTitle: "Your prints are ready.",
    readyBody: (reference) => `${reference} is in your space. The 12 PDFs are waiting there.`,
    readyCta: "Open my prints",
    readyFooter: "A question? Write to us at",
    loginSubject: "Your Bible Deco space",
    loginTitle: "Find your prints again.",
    loginBody: "Click to open your space. No password.",
    loginCta: "Open my prints",
    loginFooter: "A question?",
  },
};

export function parseLocale(value: unknown): Locale {
  return value === "en" ? "en" : "fr";
}

export function getCopy(locale: Locale = "fr"): AppCopy {
  return locale === "en" ? en : fr;
}
