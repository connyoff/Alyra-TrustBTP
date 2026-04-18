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
      line1: 'Rénovez en confiance',
      line2Prefix: 'Payez en',
      line2Middle: 'sécurité',
      line2Suffix: '',
    },
    subtitle:
      "Avec Trust BTP, vous travaillez en confiance grâce à un paiement sécurisé étape par étape.",
    extraLine: '',
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

  // ---------- Steps (aligné sur les diagrammes Excalidraw — 5 étapes) ----------
  steps: {
    title: 'Comment ça',
    titleHighlight: 'fonctionne',
    list: [
      {
        num: '01',
        title: 'Inscription & KYC',
        desc: 'Vous créez votre compte. Votre identité est vérifiée simplement.',
      },
      {
        num: '02',
        title: 'Devis & Signature',
        desc: 'Les étapes, les montants et les preuves attendues sont définis et signés.',
      },
      {
        num: '03',
        title: 'Dépôt du budget',
        desc: 'Vous déposez 110 % (100 % chantier + 5 % service + 5 % provision remboursable). Option : activer l’avantage fidélité.',
      },
      {
        num: '04',
        title: 'Validation des étapes',
        desc: 'Chaque étape validée libère automatiquement son paiement.',
      },
      {
        num: '05',
        title: 'Rapport final',
        desc: 'Le chantier est clôturé et tout l’historique reste accessible.',
      },
    ],
  },

  // ---------- Arbitrage (branche d'exception du diagramme Excalidraw) ----------
  arbitrage: {
    title: 'En cas de désaccord : un cadre clair',
    subtitle:
      "Si vous ne parvenez pas à vous entendre sur une étape, un processus en 3 niveaux est prévu. Les fonds restent gelés tant qu'une solution n'est pas trouvée.",
    levels: [
      {
        num: '1',
        name: 'Amiable',
        duration: '7 jours',
        desc: 'Échange direct entre particulier et artisan pour trouver une solution.',
      },
      {
        num: '2',
        name: 'Médiation',
        duration: '30 jours',
        desc: "Intervention d'un médiateur indépendant partenaire pour faciliter un accord et proposer un pourcentage de répartition du jalon.",
      },
      {
        num: '3',
        name: 'Recours externe',
        duration: 'Sortie Trust BTP',
        desc: "Dossier complet fourni (preuves horodatées, historique) pour action juridique ou recours à l'assurance.",
      },
    ],
    note:
      "Trust BTP ne décide jamais de l'issue du litige — la résolution est confiée à un tiers indépendant, et au-delà la voie juridique ou assurantielle reste ouverte.",
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

  // ---------- Budget Transparent (décomposition 110 %) ----------
  budgetTransparent: {
    title: 'Votre budget, en toute transparence',
    subtitle:
      "À la signature du devis, vous déposez 110 % du coût du chantier. Voici exactement à quoi sert chaque euro.",
    total: '110 %',
    totalLabel: 'déposés à la signature',
    breakdown: [
      {
        pct: '100 %',
        label: 'Coût du chantier',
        desc: 'Versé à l’artisan au rythme des étapes validées.',
        color: 'teal' as const,
      },
      {
        pct: '5 %',
        label: 'Commission Trust BTP',
        desc: 'Pour faire vivre le service : orchestration, sécurité, support.',
        color: 'purple' as const,
      },
      {
        pct: '5 %',
        label: 'Provision litige',
        desc: 'Remboursée intégralement si pas de litige. Sinon, couvre la médiation.',
        color: 'orange' as const,
      },
    ],
    loyaltyOption: {
      title: 'Avantage fidélité intégré au paiement',
      description:
        "Au moment du dépôt, vous pouvez activer une option : pendant que votre budget attend entre deux étapes, les fonds non utilisés peuvent vous donner accès à des avantages fidélité liés à votre chantier.",
      bullets: [
        'Option activable à l’étape du dépôt du budget',
        'Avantages liés à votre chantier',
        'Aucune gestion à faire de votre côté',
        'Disponibles dès que le chantier en a besoin',
      ],
      note:
        'Ces avantages sont liés au projet et ne constituent pas un produit financier.',
    },
  },

  // ---------- Choose Persona (Particulier / Artisan) ----------
  choosePersona: {
    title: 'Vous êtes…',
    subtitle: 'Votre parcours sera adapté à votre profil.',
    particulier: {
      title: 'Particulier',
      subtitle: 'Je fais faire des travaux dans mon logement',
      bullets: [
        'Je garde le contrôle de mon budget',
        'Je paie au rythme des étapes validées',
        'Je bénéficie d’avantages fidélité sur les fonds en attente',
      ],
      cta: 'Créer mon compte particulier',
    },
    artisan: {
      title: 'Artisan',
      subtitle: 'Je réalise des chantiers pour des particuliers',
      bullets: [
        'Ma trésorerie est sécurisée dès le démarrage',
        'Je reçois les paiements à chaque étape validée',
        'Je rejoins un réseau d’artisans référencés',
      ],
      cta: 'Créer mon compte artisan',
    },
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

  // ---------- KYC (préservée — utilisée par MoneriumKYC.tsx, mode particulier + artisan) ----------
  kycMonerium: {
    titleParticulier: 'Créer votre compte particulier',
    titleArtisan: 'Créer votre compte artisan professionnel',
    title: 'Créer votre compte Trust BTP',
    subtitle:
      "Votre identité est vérifiée par notre partenaire. Le parcours reste simple, sécurisé et pensé pour un usage grand public.",
    subtitleArtisan:
      "Votre identité et votre entreprise sont vérifiées par notre partenaire. KYB pro avec SIRET, Kbis et attestation décennale.",
    artisanFields: {
      siretLabel: 'Numéro SIRET',
      siretPlaceholder: '123 456 789 00012',
      siretHelp: 'Vérifié automatiquement via l’INSEE',
      kbisLabel: 'Extrait Kbis (< 3 mois)',
      kbisHelp: 'PDF · délivré par le greffe du tribunal de commerce',
      decennalLabel: 'Attestation de décennale',
      decennalHelp: 'PDF · en cours de validité',
    },
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
