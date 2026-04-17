/**
 * ===========================================================================
 *  Trust BTP — CONTENU ÉDITABLE DE L'INTERFACE
 * ===========================================================================
 *
 * Tous les textes de l'app sont centralisés ici pour faciliter les corrections
 * rapides sans fouiller dans le code. Modifie une valeur, sauvegarde,
 * Next.js recharge la page automatiquement.
 * ===========================================================================
 */

export const CONTENT = {
  brand: {
    name: 'Trust BTP',
    tagline: 'Le paiement sécurisé par étapes pour vos chantiers de rénovation',
  },

  // ---------- Hero ----------
  hero: {
    badge: 'Simple, sécurisé et pensé pour les travaux',
    title: {
      line1: 'Payez vos travaux',
      line2Prefix: 'étape par',
      line2Middle: 'étape',
      line2Suffix: '',
    },
    subtitle:
      "L'argent est libéré uniquement lorsque chaque étape du chantier est validée.",
    extraLine:
      "Et pendant les phases d\u2019attente, vos fonds peuvent vous faire bénéficier d\u2019avantages fidélité liés à votre projet.",
    trustItems: [
      'Budget sécurisé dès le départ',
      'Paiement uniquement après validation',
      'Suivi clair à chaque étape',
      'Médiation prévue en cas de désaccord',
    ],
    ctaPrimary: 'Créer mon chantier sécurisé',
    ctaSecondary: 'Découvrir le fonctionnement',
  },

  // ---------- Choose Login ----------
  chooseLogin: {
    title: 'Comment souhaitez-vous démarrer ?',
    subtitle:
      "Choisissez le parcours qui vous convient. Trust BTP peut s\u2019utiliser comme un service classique, ou avec votre wallet si vous êtes déjà équipé.",

    monerium: {
      badge: 'Recommandé · Simple et sans crypto visible',
      title: 'Créer mon compte',
      subtitle: 'Un parcours fluide, comme un service en ligne classique',
      description:
        "Vous utilisez Trust BTP simplement, avec une vérification d\u2019identité et un parcours guidé. Aucun wallet à installer, aucune complexité technique à gérer.",
      bullets: [
        "Vérification d\u2019identité rapide",
        'Parcours simple et accompagné',
        'Aucune connaissance technique nécessaire',
        'Idéal pour particuliers et artisans',
      ],
      cta: 'Créer mon compte',
    },

    wallet: {
      badge: 'Avancé · Pour utilisateurs déjà équipés',
      title: 'Connecter mon wallet',
      subtitle: 'Rabby, MetaMask, Coinbase Wallet\u2026',
      description:
        "Vous avez déjà un wallet ? Connectez-le directement pour accéder à votre chantier et suivre vos opérations en toute autonomie.",
      bullets: [
        'Connexion directe à votre wallet',
        'Accès autonome à vos opérations',
        'Suivi détaillé du chantier',
        'Pour utilisateurs familiers du Web3',
      ],
      cta: 'Connecter mon wallet',
    },
  },

  // ---------- KYC ----------
  kycMonerium: {
    title: 'Créer votre compte Trust BTP',
    subtitle:
      'Votre identité est vérifiée par notre partenaire. Le parcours reste simple, sécurisé et pensé pour un usage grand public.',

    fields: {
      emailLabel: 'Adresse e-mail',
      emailPlaceholder: 'prenom.nom@exemple.fr',
      phoneLabel: 'Numéro de téléphone',
      phonePlaceholder: '+33 6 12 34 56 78',
      idLabel: "Pièce d'identité",
      idHelp: 'PDF ou JPG · max 5 Mo',
      ribLabel: 'RIB',
      ribHelp: 'Facultatif à cette étape',
    },

    sidePanel: {
      title: 'COMMENT ÇA SE PASSE',
      items: [
        {
          title: 'Votre identité est vérifiée',
          sub: 'par un partenaire agréé, selon les règles en vigueur',
        },
        {
          title: 'Votre parcours de paiement est sécurisé',
          sub: 'pour protéger chaque étape du chantier',
        },
        {
          title: 'Les éléments techniques sont créés automatiquement',
          sub: 'sans action complexe de votre part',
        },
        {
          title: 'Vos données restent protégées',
          sub: 'avec un traitement conforme aux exigences applicables',
        },
      ],
      callout: {
        title: 'Une expérience simple',
        body: 'Vous utilisez Trust BTP comme un service classique. Toute la complexité technique reste en arrière-plan.',
      },
    },

    submit: 'Valider et continuer',
    disclaimer:
      'En validant, vous acceptez les conditions de Trust BTP et celles de notre partenaire.',
    switchToWallet: "J\u2019ai déjà un wallet — je préfère l\u2019utiliser",
  },

  // ---------- Steps ----------
  steps: {
    title: 'Comment ça',
    titleHighlight: 'fonctionne',
    list: [
      {
        num: '01',
        title: 'Créer le chantier',
        desc: "Les étapes, les montants et les conditions de validation sont définis à l\u2019avance.",
      },
      {
        num: '02',
        title: 'Sécuriser le budget',
        desc: 'Le budget prévu pour le chantier est déposé au départ pour lancer les travaux dans un cadre clair.',
      },
      {
        num: '03',
        title: 'Valider chaque étape',
        desc: 'À chaque étape terminée, le paiement est libéré lorsque le travail est validé.',
      },
      {
        num: '04',
        title: 'Clôturer le chantier',
        desc: "Une fois les travaux terminés, tout l\u2019historique du projet reste accessible.",
      },
    ],
  },

  // ---------- Value Proposition ----------
  valueProposition: {
    title: 'Un système plus serein pour tous',
    artisan: {
      title: 'Pour les artisans',
      subtitle: 'Une trésorerie mieux sécurisée et des paiements plus fluides',
      points: [
        'Le budget est prévu dès le départ',
        "Les paiements suivent l\u2019avancement réel du chantier",
        "Moins de retards et moins d\u2019incertitude",
        'Une relation client plus claire et plus professionnelle',
      ],
    },
    particulier: {
      title: 'Pour les particuliers',
      subtitle: 'Plus de confiance, plus de contrôle, moins de stress',
      points: [
        'Vous gardez la main sur votre budget',
        'Vous payez au fur et à mesure des étapes validées',
        'Vous suivez le chantier avec plus de transparence',
        'Un cadre prévu en cas de désaccord',
      ],
    },
  },

  // ---------- Loyalty / Benefits ----------
  loyaltyBenefits: {
    title: 'Votre budget peut aussi vous ouvrir des avantages',
    subtitle:
      "Pendant les phases d\u2019attente entre deux étapes, les fonds non utilisés peuvent vous faire bénéficier d\u2019avantages fidélité liés à votre chantier, selon les modalités prévues.",
    bullets: [
      'Option activable selon le projet',
      'Avantages fidélité dédiés aux travaux',
      'Aucune action complexe à gérer',
      'Toujours compatible avec le rythme du chantier',
    ],
    note:
      'Ces avantages sont liés au projet et ne constituent pas un produit financier.',
  },

  // ---------- Actions ----------
  actions: {
    back: '← Retour',
    continue: 'Continuer →',
    cancel: 'Annuler',
    close: 'Fermer',
  },
} as const
