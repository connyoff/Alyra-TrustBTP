/**
 * ===========================================================================
 *  Trust BTP — CONTENU ÉDITABLE DE L'INTERFACE
 * ===========================================================================
 *
 * Tous les textes de l'app sont centralisés ici pour faciliter les corrections
 * rapides sans fouiller dans le code. Modifie une valeur, sauvegarde,
 * Next.js recharge la page automatiquement.
 *
 * Convention : garder la structure, ne modifier que les chaînes de caractères.
 * ===========================================================================
 */

export const CONTENT = {
  brand: {
    name: 'Trust BTP',
    tagline: "L'escrow décentralisé pour vos chantiers",
  },

  // ---------- Hero (landing) ----------
  hero: {
    badge: 'Paiements sécurisés par smart contract',
    title: {
      line1: 'Sécurisez vos chantiers',
      line2Prefix: "avec l'",
      line2Middle: 'escrow',
      line2Suffix: 'décentralisé',
    },
    subtitle:
      'Dépôt, jalons, validation, libération — chaque étape est automatisée, traçable et transparente.',
    trustItems: [
      'Aucun intermédiaire',
      'Fonds bloqués en escrow',
      'Libération par jalons',
      'Arbitrage intégré',
    ],
    ctaPrimary: 'Commencer',
    ctaSecondary: "En savoir plus",
  },

  // ---------- Choose Login (Monerium vs Wallet) ----------
  chooseLogin: {
    title: 'Comment souhaitez-vous vous connecter ?',
    subtitle:
      'Trust BTP vous propose deux chemins selon votre profil. Vous pouvez changer plus tard.',

    monerium: {
      badge: 'Recommandé · Grand public',
      title: 'Compte Trust BTP',
      subtitle: 'Avec KYC Monerium · pas de crypto visible',
      description:
        'Connexion via email et pièce d\'identité. Aucun wallet à installer. Tout est géré en coulisse par notre partenaire bancaire Monerium (EMI MiCA agréée).',
      bullets: [
        'KYC conforme LCB-FT en 3 min',
        'IBAN dédié créé automatiquement',
        'Crypto invisible (Web2 experience)',
        'Idéal pour les particuliers et artisans',
      ],
      cta: 'Ouvrir mon compte',
    },

    wallet: {
      badge: 'Power user · Web3 natif',
      title: 'Connecter mon wallet',
      subtitle: 'Rabby, MetaMask, Coinbase Wallet…',
      description:
        'Utilisez votre wallet existant. Le NFT chantier s\'affiche directement dedans. Vous gardez la self-custody complète et l\'accès aux preuves on-chain.',
      bullets: [
        'Self-custody complète',
        'NFT chantier visible dans le wallet',
        'Accès direct aux transactions on-chain',
        'Pour développeurs et utilisateurs avertis',
      ],
      cta: 'Connecter mon wallet',
    },
  },

  // ---------- Monerium KYC Form ----------
  kycMonerium: {
    title: 'Ouvrir votre compte Trust BTP',
    subtitle:
      'KYC opéré par Monerium — établissement de monnaie électronique agréé (EMI MiCA Titre III). Pas de crypto visible dans votre parcours.',

    fields: {
      emailLabel: 'Adresse e-mail',
      emailPlaceholder: 'prenom.nom@exemple.fr',
      phoneLabel: 'Numéro de téléphone',
      phonePlaceholder: '+33 6 12 34 56 78',
      idLabel: "Pièce d'identité (CNI / passeport)",
      idHelp: 'PDF ou JPG · max 5 Mo · recto-verso si CNI',
      ribLabel: 'RIB (pour le remboursement de la provision médiation)',
      ribHelp: 'Facultatif à cette étape — pourra être complété plus tard',
    },

    sidePanel: {
      title: 'EN COULISSE',
      items: [
        {
          title: 'Monerium vérifie votre identité',
          sub: 'LCB-FT + DSP2, conformité européenne',
        },
        {
          title: 'Un IBAN dédié est créé',
          sub: 'cantonnement ACPR',
        },
        {
          title: 'Un wallet smart contract vous est assigné',
          sub: 'invisible pour vous — vous restez côté Web2',
        },
        {
          title: 'Vos données sensibles sont chiffrées',
          sub: 'RGPD · stockage européen off-chain',
        },
      ],
      callout: {
        title: 'Web3 invisible.',
        body: 'Aucun mot de passe crypto, aucune clé privée. Vous ne voyez que votre banque et Trust BTP.',
      },
    },

    submit: 'Valider mon KYC — continuer',
    disclaimer:
      'En validant, vous acceptez les CGU de Trust BTP et les conditions de Monerium EMI.',
    switchToWallet:
      "Je suis un utilisateur avancé — je préfère connecter mon wallet (Rabby, MetaMask…)",
  },

  // ---------- Steps explainer ----------
  steps: {
    title: 'Comment ça',
    titleHighlight: 'marche',
    list: [
      {
        num: '01',
        title: 'Créer le chantier',
        desc: "L'artisan définit les jalons, montants et conditions de validation.",
      },
      {
        num: '02',
        title: 'Déposer les fonds',
        desc: "Le client dépose 110 % du devis dans le smart contract d'escrow.",
      },
      {
        num: '03',
        title: 'Valider les jalons',
        desc: 'À chaque étape, le client valide — les fonds sont libérés à l\'artisan.',
      },
      {
        num: '04',
        title: 'Clôturer',
        desc: 'Le chantier est terminé, les fonds sont intégralement distribués.',
      },
    ],
  },

  // ---------- Two audiences ----------
  audiences: {
    title: 'Conçu pour',
    titleHighlight: 'deux mondes',

    particuliers: {
      title: 'Particuliers',
      lead: 'Vous faites des travaux ? Ne payez plus dans le flou.',
      items: [
        'Vos fonds sont bloqués, pas perdus — visibilité totale',
        'Libération uniquement quand le jalon est validé',
        'Mécanisme de contestation intégré si désaccord',
        "Plus besoin d'attendre 6–24 mois devant un tribunal",
        'Adapté aux chantiers < 15 000 €',
      ],
    },

    artisans: {
      title: 'Artisans',
      lead: 'Vous êtes artisan ? Sécurisez votre trésorerie.',
      items: [
        'Le paiement est préparé et verrouillé avant le démarrage',
        'Libération automatique à chaque jalon validé',
        'Plus de retards de paiement ou de clients fantômes',
        'Confiance renforcée avec vos clients',
        'Concentrez-vous sur le chantier, pas sur le recouvrement',
      ],
    },
  },

  // ---------- Common actions ----------
  actions: {
    back: '← Retour',
    continue: 'Continuer →',
    cancel: 'Annuler',
    close: 'Fermer',
  },
} as const
