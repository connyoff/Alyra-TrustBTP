# 📝 Éditer les textes de l'interface Trust BTP

## Fichier unique : `content.ts`

Tous les textes de l'application (landing, onboarding, KYC, explications) sont centralisés dans **`src/config/content.ts`**.

Pour corriger un texte, ouvre ce fichier dans ton éditeur (VSCode), trouve la ligne à modifier, change la valeur entre guillemets, sauvegarde — Next.js recharge la page automatiquement.

## Exemples rapides

### Changer le titre principal de la landing

```ts
// src/config/content.ts
hero: {
  title: {
    line1: 'Sécurisez vos chantiers',   // ← modifie ici
    line2Prefix: "avec l'",
    line2Middle: 'escrow',
    line2Suffix: 'décentralisé',
  },
  ...
}
```

### Ajouter ou modifier une étape "Comment ça marche"

```ts
steps: {
  list: [
    { num: '01', title: 'Créer le chantier', desc: '...' },
    { num: '02', title: 'Déposer les fonds', desc: '...' },
    // ← ajoute ou modifie ici
    { num: '03', title: 'Valider les jalons', desc: '...' },
    { num: '04', title: 'Clôturer', desc: '...' },
  ],
}
```

### Changer le texte du bouton Monerium

```ts
chooseLogin: {
  monerium: {
    cta: 'Ouvrir mon compte',   // ← modifie ici
    ...
  },
}
```

## Structure du fichier content.ts

| Section | Description |
|---|---|
| `brand` | Nom de la marque, tagline |
| `hero` | Landing page principale (titre, sous-titre, CTA, trust items) |
| `chooseLogin` | Écran de choix Monerium / Wallet (2 cartes) |
| `kycMonerium` | Formulaire KYC (labels, placeholders, side panel) |
| `steps` | Bloc "Comment ça marche" |
| `audiences` | Bloc "Conçu pour deux mondes" (Particuliers / Artisans) |
| `actions` | Textes des boutons communs (Retour, Continuer…) |

## Règles

1. **Ne change que les valeurs entre guillemets.** Ne touche ni les noms de clés, ni la structure.
2. Garde les apostrophes typographiques (`'`) pour un rendu français propre.
3. Pour les retours à la ligne, utilise `\n` ou sépare en sous-clés comme `title.line1` / `title.line2`.
4. Pour ajouter un item dans une liste (ex: une étape de plus), copie la dernière ligne et modifie-la.

## Ça va où ?

Ces textes sont utilisés dans :

- `src/components/shared/NotConnected.tsx` — landing page
- `src/components/onboarding/ChooseLogin.tsx` — choix Monerium/Wallet
- `src/components/onboarding/MoneriumKYC.tsx` — formulaire KYC
- `src/components/onboarding/OnboardingFlow.tsx` — orchestration

## Pour une édition encore plus facile

Tu peux connecter un CMS headless (Sanity, Contentful, Strapi) pour éditer via une interface web au lieu du fichier. Mais le `content.ts` est déjà très facile à maintenir à deux.
