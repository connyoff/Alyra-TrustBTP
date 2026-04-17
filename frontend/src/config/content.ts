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
    tagline: 'Le paiement sécurisé par étapes pour vos travaux',
  },

  // ---------- Hero ----------
  hero: {
    badge: 'Un système simple pour travailler en confiance',
    title: {
      line1: 'Vous êtes particulier ?',
      line2Prefix: 'Vous êtes',
      line2Middle: 'artisan',
      line2Suffix: '?',
    },
    subtitle:
      "Avec Trust BTP, vous travaillez en confiance grâce à un paiement sécurisé étape par étape.",
    extraLine:
      "Le particulier garde le contrôle. L’artisan sécurise sa trésorerie.",
    trustItems: [
      'Paiement sécurisé dès le départ',
      'Libération à chaque étape validée',
      'Moins de risques et moins de tensions',
      'Artisans référencés disponibles',
    ],
    ctaPrimary: 'Créer mon chantier',
    ctaSecondary: 'Voir comment ça marche',
  },

  // ---------- Direct Address Section ----------
  directAddress: {
    title: 'Une solution pensée pour vous',
    particulier: {
      title: 'Vous êtes particulier ?',
      text:
        "Vous ne voulez plus payer en avance sans garantie. Vous voulez garder le contrôle de votre budget et avancer sereinement dans vos travaux.",
      highlight:
        "Avec Trust BTP, vous payez uniquement lorsque chaque étape est validée.",
    },
    artisan: {
      title: 'Vous êtes artisan ?',
      text:
        "Vous en avez assez des retards de paiement et du manque de visibilité. Vous avez besoin de sécuriser votre trésorerie dès le départ.",
      highlight:
        "Avec Trust BTP, les paiements suivent l’avancement réel de votre chantier.",
    },
  },

  // ---------- Steps ----------
  steps: {
    title: 'Comment ça',
    titleHighlight: 'fonctionne',
    list: [
      {
        num: '01',
        title: 'Créez votre chantier',
        desc: 'Les étapes et les montants sont définis à l’avance.',
      },
      {
        num: '02',
        title: 'Sécurisez le budget',
        desc: 'Le budget est réservé pour garantir le bon déroulement du chantier.',
      },
      {
        num: '03',
        title: 'Validez chaque étape',
        desc: "Le paiement est libéré uniquement lorsque le travail est validé.",
      },
      {
        num: '04',
        title: 'Finalisez en confiance',
        desc: 'Le chantier se termine dans un cadre clair pour tous.',
      },
    ],
  },

  // ---------- Value Proposition ----------
  valueProposition: {
    title: 'Concrètement, ce que ça change pour vous',
    particulier: {
      title: 'Pour vous, particulier',
      points: [
        'Vous gardez le contrôle de votre budget',
        'Vous payez uniquement lorsque le travail est fait',
        'Vous suivez chaque étape du chantier',
        'Vous réduisez les risques et les mauvaises surprises',
      ],
    },
    artisan: {
      title: 'Pour vous, artisan',
      points: [
        'Votre trésorerie est sécurisée dès le départ',
        'Les paiements arrivent au rythme du chantier',
        'Vous limitez les retards et les impayés',
        'Vous travaillez dans un cadre plus clair avec vos clients',
      ],
    },
  },

  // ---------- Referenced Artisans ----------
  artisanNetwork: {
    title: 'Besoin de trouver le bon artisan ?',
    subtitle:
      "Trust BTP vous permet aussi d’accéder à des artisans référencés, pour démarrer votre projet dans un cadre plus rassurant dès le départ.",
    particulier: {
      title: 'Vous êtes particulier ?',
      text:
        "Consultez notre réseau d’artisans référencés et trouvez plus facilement un professionnel adapté à votre chantier.",
      cta: 'Voir les artisans référencés',
    },
    artisan: {
      title: 'Vous êtes artisan ?',
      text:
        "Rejoignez notre réseau d’artisans référencés et développez votre activité dans un cadre de paiement sécurisé.",
      cta: 'Rejoindre le réseau',
    },
    highlights: [
      'Artisans référencés',
      'Mise en relation simplifiée',
      'Cadre de paiement sécurisé',
      'Plus de confiance dès le départ',
    ],
  },

  // ---------- Loyalty / Benefits ----------
  loyaltyBenefits: {
    title: 'Un budget qui reste utile pendant le chantier',
    subtitle:
      "Entre deux étapes, les fonds non utilisés peuvent vous donner accès à des avantages fidélité liés à votre projet.",
    bullets: [
      'Option activable selon le chantier',
      'Avantages liés aux travaux',
      'Aucune action complexe à gérer',
      'Toujours compatible avec les étapes',
    ],
    note:
      'Ces avantages sont liés au projet et ne constituent pas un produit financier.',
  },

  // ---------- Choose Login ----------
  chooseLogin: {
    title: 'Démarrez simplement',
    subtitle:
      "Utilisez Trust BTP comme un service classique ou connectez votre wallet si vous êtes déjà équipé.",
    monerium: {
      badge: 'Recommandé',
      title: 'Créer mon compte',
      subtitle: 'Simple et sans complexité',
      description:
        "Aucun wallet à installer. Vous utilisez Trust BTP comme un service en ligne classique.",
      bullets: [
        'Parcours guidé',
        'Aucune connaissance technique nécessaire',
        'Pensé pour tous',
      ],
      cta: 'Créer mon compte',
    },
    wallet: {
      badge: 'Avancé',
      title: 'Connecter mon wallet',
      subtitle: 'Pour utilisateurs équipés',
      description:
        "Connectez votre wallet pour accéder directement à votre chantier.",
      bullets: [
        'Connexion directe',
        'Accès autonome',
        'Pour utilisateurs avancés',
      ],
      cta: 'Connecter mon wallet',
    },
  },

  // ---------- KYC (préservée — utilisée par MoneriumKYC.tsx) ----------
  kycMonerium: {
    title: 'Créer votre compte Trust BTP',
    subtitle:
      "Votre identité est vérifiée par notre partenaire. Le parcours reste simple, sécurisé et pensé pour un usage grand public.",
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
    switchToWallet: 'J’ai déjà un wallet — je préfère l’utiliser',
  },

  // ---------- Actions ----------
  actions: {
    back: '← Retour',
    continue: 'Continuer →',
    cancel: 'Annuler',
    close: 'Fermer',
  },
} as const
