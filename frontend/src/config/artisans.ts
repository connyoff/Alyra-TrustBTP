/**
 * ===========================================================================
 *  Trust BTP — RÉFÉRENTIEL ARTISANS (données éditables)
 * ===========================================================================
 *
 * Cette liste est mockée pour le MVP. En production, elle sera remplacée par
 * un backend (Supabase / Postgres / etc.) avec :
 *   - inscription artisan + KYB Monerium
 *   - upload certificats (décennale, RGE, Qualibat…)
 *   - vérification SIRET via API INSEE
 *   - modération + photos portfolio
 *
 * Le TRUST SCORE, lui, vient toujours de la blockchain (TrustScoreRegistry.sol)
 * et est lu en temps réel via le hook useTrustScore.
 *
 * Pour ajouter un artisan de démo : copie une entrée et modifie les champs.
 * ===========================================================================
 */

export type Specialty =
  | 'plomberie'
  | 'electricite'
  | 'maconnerie'
  | 'peinture'
  | 'menuiserie'
  | 'carrelage'
  | 'renovation'
  | 'chauffage'
  | 'toiture'
  | 'isolation'

export type Artisan = {
  slug: string
  name: string
  company: string
  walletAddress: `0x${string}`   // utilisé pour lire le Trust Score on-chain
  city: string
  postalCode: string
  department: string              // ex: "75", "92", "13"
  radiusKm: number                // rayon d'intervention
  specialties: Specialty[]
  rating: number                  // 0-5 (agrégé off-chain, legacy avis)
  onChainScore: number            // fallback si wallet non renseigné (0-100)
  completedChantiers: number
  yearsExperience: number
  tagline: string
  bio: string
  avatarColor: string             // couleur de fond de l'avatar (Tailwind-like hex)
  initials: string
  avgPrice: string                // gamme tarifaire indicative
  certifications: string[]        // ex: ["Décennale Groupama", "RGE", "Qualibat"]
  available: boolean              // disponibilité déclarée
}

export const ARTISANS: Artisan[] = [
  {
    slug: 'marc-plombier-sarl',
    name: 'Marc Lefèvre',
    company: 'Marc Plombier SARL',
    walletAddress: '0x7F4EAB3D8c9B6f1A2E5c8F9A0D3B2e1c4F5A3E9A',
    city: 'Paris 11',
    postalCode: '75011',
    department: '75',
    radiusKm: 15,
    specialties: ['plomberie', 'chauffage', 'renovation'],
    rating: 4.8,
    onChainScore: 87,
    completedChantiers: 34,
    yearsExperience: 12,
    tagline: 'Plomberie générale & installation sanitaire',
    bio: 'Artisan plombier certifié depuis 12 ans. Spécialisé en rénovation salle de bain complète et installation de chaudières. Interventions sous 48h sur Paris et proche banlieue.',
    avatarColor: '#0A1628',
    initials: 'ML',
    avgPrice: '45-65 € / h',
    certifications: ['Décennale Groupama', 'RGE QualiGaz', 'PGN / PGP'],
    available: true,
  },
  {
    slug: 'sophie-elec',
    name: 'Sophie Durand',
    company: 'SD Électricité',
    walletAddress: '0xA1B2C3D4E5F6789012345678abCdef0012345678',
    city: 'Boulogne-Billancourt',
    postalCode: '92100',
    department: '92',
    radiusKm: 20,
    specialties: ['electricite', 'renovation'],
    rating: 4.9,
    onChainScore: 92,
    completedChantiers: 48,
    yearsExperience: 15,
    tagline: 'Électricité générale & domotique',
    bio: 'Électricienne certifiée Consuel. Mise en conformité, tableau électrique, domotique KNX. Forte expérience en rénovation d\'appartements haussmanniens.',
    avatarColor: '#F28C28',
    initials: 'SD',
    avgPrice: '50-70 € / h',
    certifications: ['Décennale MAAF', 'Qualifelec', 'Habilitation électrique B2V/BR'],
    available: true,
  },
  {
    slug: 'btp-vincent',
    name: 'Vincent Moreau',
    company: 'BTP Moreau & Fils',
    walletAddress: '0xB3C4D5E6F7890123456789aBCDEF001234567890',
    city: 'Versailles',
    postalCode: '78000',
    department: '78',
    radiusKm: 30,
    specialties: ['maconnerie', 'renovation', 'toiture'],
    rating: 4.6,
    onChainScore: 78,
    completedChantiers: 22,
    yearsExperience: 20,
    tagline: 'Maçonnerie générale & gros œuvre',
    bio: 'Entreprise familiale BTP depuis 20 ans. Construction, extension, rénovation lourde. Équipe de 6 artisans, tous salariés. Références vérifiables sur demande.',
    avatarColor: '#2B6CB0',
    initials: 'VM',
    avgPrice: '40-55 € / h',
    certifications: ['Décennale AXA', 'Qualibat 2111 / 2112 / 2113', 'RGE Éco-Artisan'],
    available: true,
  },
  {
    slug: 'atelier-menuiserie-laurent',
    name: 'Laurent Petit',
    company: 'Atelier Menuiserie Laurent',
    walletAddress: '0xC4D5E6F7890123456789abCDEF001234567890aB',
    city: 'Issy-les-Moulineaux',
    postalCode: '92130',
    department: '92',
    radiusKm: 25,
    specialties: ['menuiserie', 'renovation'],
    rating: 4.9,
    onChainScore: 95,
    completedChantiers: 67,
    yearsExperience: 18,
    tagline: 'Menuiserie sur-mesure & agencement',
    bio: 'Menuisier ébéniste spécialisé en agencement sur-mesure : cuisine, dressing, bibliothèque. Travail exclusivement bois massif européen. Atelier à Issy.',
    avatarColor: '#8B4513',
    initials: 'LP',
    avgPrice: '55-80 € / h',
    certifications: ['Décennale Generali', 'Qualibat Menuiserie', 'PEFC bois certifié'],
    available: false,
  },
  {
    slug: 'peinture-karim',
    name: 'Karim Benali',
    company: 'Peinture & Déco Benali',
    walletAddress: '0xD5E6F7890123456789AbCDEF001234567890Abcd',
    city: 'Paris 18',
    postalCode: '75018',
    department: '75',
    radiusKm: 10,
    specialties: ['peinture', 'renovation'],
    rating: 4.7,
    onChainScore: 82,
    completedChantiers: 41,
    yearsExperience: 10,
    tagline: 'Peinture décorative & enduits',
    bio: 'Peintre en bâtiment, spécialisé en finitions décoratives : béton ciré, tadelakt, peinture chaux. Chantiers résidentiels et bureaux.',
    avatarColor: '#D97706',
    initials: 'KB',
    avgPrice: '35-55 € / h',
    certifications: ['Décennale Allianz', 'Qualibat Peinture', 'Attestation chaux naturelle'],
    available: true,
  },
  {
    slug: 'carrelage-mathieu',
    name: 'Mathieu Gomez',
    company: 'Gomez Carrelage',
    walletAddress: '0xE6F7890123456789abCDEF001234567890aBcDeF',
    city: 'Nanterre',
    postalCode: '92000',
    department: '92',
    radiusKm: 25,
    specialties: ['carrelage', 'renovation'],
    rating: 4.5,
    onChainScore: 74,
    completedChantiers: 19,
    yearsExperience: 8,
    tagline: 'Pose de carrelage & faïence',
    bio: 'Carreleur indépendant. Pose de grès cérame grand format, faïence murale, mosaïque. Précision et finitions soignées. Chantiers résidentiels uniquement.',
    avatarColor: '#4A90E2',
    initials: 'MG',
    avgPrice: '40-60 € / h',
    certifications: ['Décennale MMA', 'Qualibat Carrelage'],
    available: true,
  },
  {
    slug: 'toiture-phillipe',
    name: 'Philippe Rousseau',
    company: 'Rousseau Couverture',
    walletAddress: '0xF7890123456789abCDEF001234567890AbCDef01',
    city: 'Colombes',
    postalCode: '92700',
    department: '92',
    radiusKm: 30,
    specialties: ['toiture', 'isolation'],
    rating: 4.8,
    onChainScore: 89,
    completedChantiers: 53,
    yearsExperience: 25,
    tagline: 'Couverture, zinguerie & isolation',
    bio: 'Couvreur zingueur expérimenté. Réfection toiture, isolation combles, pose de gouttières, velux. Certifié RGE pour aides MaPrimeRénov.',
    avatarColor: '#6B5C47',
    initials: 'PR',
    avgPrice: '50-75 € / h',
    certifications: ['Décennale Groupama', 'RGE Qualibat', 'Qualibat Couverture 3183'],
    available: true,
  },
  {
    slug: 'renov-aline',
    name: 'Aline Garcia',
    company: 'Aline Rénov',
    walletAddress: '0x89012345EF678901cdeF234567890aBcDEf01234',
    city: 'Montreuil',
    postalCode: '93100',
    department: '93',
    radiusKm: 15,
    specialties: ['renovation', 'peinture', 'carrelage', 'plomberie'],
    rating: 4.7,
    onChainScore: 84,
    completedChantiers: 29,
    yearsExperience: 7,
    tagline: 'Rénovation complète clé en main',
    bio: 'Entrepreneuse indépendante. Rénovation complète d\'appartements, coordination multi-métiers, suivi de chantier transparent. Parfait pour rénos < 50 m².',
    avatarColor: '#C47AA8',
    initials: 'AG',
    avgPrice: '450-650 € / jour',
    certifications: ['Décennale Groupama', 'RGE', 'Qualibat Rénovation'],
    available: true,
  },
  {
    slug: 'chauffage-nicolas',
    name: 'Nicolas Martin',
    company: 'Martin Chauffage SARL',
    walletAddress: '0x9012345EF6789012345678abCdeF0123456789AB',
    city: 'Asnières-sur-Seine',
    postalCode: '92600',
    department: '92',
    radiusKm: 25,
    specialties: ['chauffage', 'plomberie'],
    rating: 4.6,
    onChainScore: 80,
    completedChantiers: 36,
    yearsExperience: 14,
    tagline: 'Chauffage & pompes à chaleur',
    bio: 'Spécialiste chauffage et énergies renouvelables. Pompes à chaleur, chaudières gaz, planchers chauffants. Accompagnement aides CEE et MaPrimeRénov.',
    avatarColor: '#14213D',
    initials: 'NM',
    avgPrice: '55-75 € / h',
    certifications: ['Décennale MAAF', 'RGE QualiPAC', 'RGE QualiGaz', 'Qualibat 5212'],
    available: true,
  },
  {
    slug: 'isolation-eco',
    name: 'Julie Durand',
    company: 'Éco-Isolation Durand',
    walletAddress: '0xA012345EF6789abcDEF01234567890AbcdEf0123',
    city: 'Saint-Denis',
    postalCode: '93200',
    department: '93',
    radiusKm: 20,
    specialties: ['isolation', 'toiture'],
    rating: 4.8,
    onChainScore: 88,
    completedChantiers: 44,
    yearsExperience: 11,
    tagline: 'Isolation écologique & étanchéité',
    bio: 'Isolation thermique (ITE, ITI, combles), matériaux biosourcés : ouate de cellulose, chanvre, liège. Spécialiste MaPrimeRénov\' Sérénité.',
    avatarColor: '#1F7A3E',
    initials: 'JD',
    avgPrice: '45-60 € / h',
    certifications: ['Décennale SMABTP', 'RGE Qualibat 7131 / 7141', 'Éco-artisan CAPEB'],
    available: true,
  },
]

export const SPECIALTY_LABELS: Record<Specialty, string> = {
  plomberie: 'Plomberie',
  electricite: 'Électricité',
  maconnerie: 'Maçonnerie',
  peinture: 'Peinture',
  menuiserie: 'Menuiserie',
  carrelage: 'Carrelage',
  renovation: 'Rénovation',
  chauffage: 'Chauffage',
  toiture: 'Toiture',
  isolation: 'Isolation',
}

export const DEPARTMENTS_AVAILABLE = [
  { code: '75', name: 'Paris' },
  { code: '92', name: 'Hauts-de-Seine' },
  { code: '93', name: 'Seine-Saint-Denis' },
  { code: '78', name: 'Yvelines' },
  { code: '94', name: 'Val-de-Marne' },
  { code: '77', name: 'Seine-et-Marne' },
  { code: '91', name: 'Essonne' },
  { code: '95', name: 'Val-d\'Oise' },
]
