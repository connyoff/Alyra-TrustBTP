// Adresses des contrats déployés
// À mettre à jour après chaque déploiement Ignition
// Source : backend/ignition/deployments/chain-<chainId>/deployed_addresses.json

export const ESCROW_VAULT_ADDRESS = (process.env.NEXT_PUBLIC_ESCROW_VAULT_ADDRESS ?? '0xD7F652F6008FEeC43F47A178fcb144CE0A690910') as `0x${string}`
export const CHANTIER_NFT_ADDRESS = (process.env.NEXT_PUBLIC_CHANTIER_NFT_ADDRESS ?? '0x14a3579cEB5E0E01581Bb2d86e658e92151003fe') as `0x${string}`
export const TRUST_SCORE_REGISTRY_ADDRESS = (process.env.NEXT_PUBLIC_TRUST_SCORE_REGISTRY_ADDRESS ?? '0x240521bcb5ef692474f87e0A273ABe4C95572A58') as `0x${string}`
export const TOKEN_ADDRESS = (process.env.NEXT_PUBLIC_TOKEN_ADDRESS ?? '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d') as `0x${string}`

// Composant Jalon (tuple) — réutilisé dans plusieurs fonctions ABI
const JALON_COMPONENTS = [
  { name: 'description', type: 'string' },
  { name: 'amount', type: 'uint256' },
  { name: 'status', type: 'uint8' },
  { name: 'finishedAt', type: 'uint256' },
  { name: 'artisanProofHash', type: 'bytes32' },
  { name: 'clientProofHash', type: 'bytes32' },
  { name: 'blockedAmount', type: 'uint256' },
  { name: 'penaltyAmount', type: 'uint256' },
  { name: 'deadline', type: 'uint256' },
] as const

export const ESCROW_VAULT_ABI = [
  // ── Admin (owner) ─────────────────────────────────────────────────────
  {
    name: 'owner',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'address' }],
  },
  {
    name: 'platformFees',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'token', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'yieldProvider',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'address' }],
  },
  {
    name: 'yieldPrincipal',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'token', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
  // ── Lecture publique ──────────────────────────────────────────────────
  {
    name: 'chantiers',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '', type: 'uint256' }],
    outputs: [
      { name: 'id', type: 'uint256' },
      { name: 'name', type: 'string' },
      { name: 'artisan', type: 'address' },
      { name: 'particulier', type: 'address' },
      { name: 'token', type: 'address' },
      { name: 'devisAmount', type: 'uint256' },
      { name: 'depositAmount', type: 'uint256' },
      { name: 'yieldOptIn', type: 'bool' },
      { name: 'status', type: 'uint8' },
      { name: 'currentJalonIndex', type: 'uint8' },
      { name: 'jalonCount', type: 'uint8' },
      { name: 'submittedAt', type: 'uint256' },
      { name: 'acceptedAt', type: 'uint256' },
      { name: 'completedAt', type: 'uint256' },
    ],
  },
  {
    name: 'getAllJalons',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'chantierId', type: 'uint256' }],
    outputs: [{ type: 'tuple[]', components: JALON_COMPONENTS }],
  },
  {
    name: 'getCurrentJalon',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'chantierId', type: 'uint256' }],
    outputs: [{ type: 'tuple', components: JALON_COMPONENTS }],
  },
  {
    name: 'arbiter',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'address' }],
  },
  // ── Actions artisan ───────────────────────────────────────────────────
  {
    name: 'submitDevis',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'particulier', type: 'address' },
      { name: 'token', type: 'address' },
      { name: 'devisAmount', type: 'uint256' },
      { name: 'name', type: 'string' },
      { name: 'jalonDescriptions', type: 'string[]' },
      { name: 'jalonAmounts', type: 'uint256[]' },
      { name: 'jalonDeadlines', type: 'uint256[]' },
    ],
    outputs: [{ name: 'chantierId', type: 'uint256' }],
  },
  {
    name: 'validateJalon',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'chantierId', type: 'uint256' },
      { name: 'proofHash', type: 'bytes32' },
    ],
    outputs: [],
  },
  {
    name: 'acknowledgeReserves',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'chantierId', type: 'uint256' },
      { name: 'accept', type: 'bool' },
    ],
    outputs: [],
  },
  // ── Actions particulier ───────────────────────────────────────────────
  {
    name: 'rejectDevis',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'chantierId', type: 'uint256' }],
    outputs: [],
  },
  {
    name: 'acceptDevisWithPermit',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'chantierId', type: 'uint256' },
      { name: 'yieldOptIn', type: 'bool' },
      { name: 'deadline', type: 'uint256' },
      { name: 'v', type: 'uint8' },
      { name: 'r', type: 'bytes32' },
      { name: 's', type: 'bytes32' },
    ],
    outputs: [],
  },
  {
    name: 'acceptJalon',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'chantierId', type: 'uint256' }],
    outputs: [],
  },
  {
    name: 'acceptJalonWithMinorReserves',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'chantierId', type: 'uint256' },
      { name: 'clientProofHash', type: 'bytes32' },
    ],
    outputs: [],
  },
  {
    name: 'acceptJalonWithMajorReserves',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'chantierId', type: 'uint256' },
      { name: 'clientProofHash', type: 'bytes32' },
    ],
    outputs: [],
  },
  {
    name: 'lifterReserves',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'chantierId', type: 'uint256' }],
    outputs: [],
  },
  {
    name: 'cancelChantier',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'chantierId', type: 'uint256' }],
    outputs: [],
  },
  {
    name: 'resumeChantier',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'chantierId', type: 'uint256' }],
    outputs: [],
  },
  // ── Auto-validation (n'importe qui) ──────────────────────────────────
  {
    name: 'triggerAutoValidation',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'chantierId', type: 'uint256' }],
    outputs: [],
  },
  // ── Arbitre ───────────────────────────────────────────────────────────
  {
    name: 'resolveLitige',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'chantierId', type: 'uint256' },
      { name: 'artisanEnTort', type: 'bool' },
      { name: 'blockedBps', type: 'uint256' },
      { name: 'penaltyBps', type: 'uint256' },
    ],
    outputs: [],
  },
  // ── Événements ───────────────────────────────────────────────────────
  {
    name: 'DevisSoumis',
    type: 'event',
    inputs: [
      { name: 'chantierId', type: 'uint256', indexed: true },
      { name: 'artisan', type: 'address', indexed: true },
      { name: 'particulier', type: 'address', indexed: true },
      { name: 'token', type: 'address', indexed: false },
      { name: 'devisAmount', type: 'uint256', indexed: false },
    ],
  },
  {
    name: 'DevisAccepte',
    type: 'event',
    inputs: [
      { name: 'chantierId', type: 'uint256', indexed: true },
      { name: 'particulier', type: 'address', indexed: true },
      { name: 'depositAmount', type: 'uint256', indexed: false },
      { name: 'yieldOptIn', type: 'bool', indexed: false },
    ],
  },
  {
    name: 'DevisRefuse',
    type: 'event',
    inputs: [
      { name: 'chantierId', type: 'uint256', indexed: true },
      { name: 'particulier', type: 'address', indexed: true },
    ],
  },
  {
    name: 'JalonValide',
    type: 'event',
    inputs: [
      { name: 'chantierId', type: 'uint256', indexed: true },
      { name: 'jalonIndex', type: 'uint8', indexed: false },
      { name: 'proofHash', type: 'bytes32', indexed: false },
    ],
  },
  {
    name: 'JalonAccepte',
    type: 'event',
    inputs: [
      { name: 'chantierId', type: 'uint256', indexed: true },
      { name: 'jalonIndex', type: 'uint8', indexed: false },
      { name: 'montantLibere', type: 'uint256', indexed: false },
    ],
  },
  {
    name: 'JalonAccepteAvecReserves',
    type: 'event',
    inputs: [
      { name: 'chantierId', type: 'uint256', indexed: true },
      { name: 'jalonIndex', type: 'uint8', indexed: false },
      { name: 'majeur', type: 'bool', indexed: false },
      { name: 'clientProofHash', type: 'bytes32', indexed: false },
    ],
  },
  {
    name: 'LitigeOuvert',
    type: 'event',
    inputs: [
      { name: 'chantierId', type: 'uint256', indexed: true },
      { name: 'jalonIndex', type: 'uint8', indexed: false },
    ],
  },
  {
    name: 'ChantierTermine',
    type: 'event',
    inputs: [{ name: 'chantierId', type: 'uint256', indexed: true }],
  },
  {
    name: 'ChantierAnnule',
    type: 'event',
    inputs: [{ name: 'chantierId', type: 'uint256', indexed: true }],
  },
] as const

export const TRUST_SCORE_REGISTRY_ABI = [
  {
    name: 'getStats',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'artisan', type: 'address' }],
    outputs: [
      { name: 'score', type: 'uint256' },
      { name: 'tier', type: 'uint8' },
      { name: 'chantiersCompleted', type: 'uint256' },
      { name: 'litigesCount', type: 'uint256' },
      { name: 'frozen', type: 'bool' },
    ],
  },
  {
    name: 'getScore',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'artisan', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'ScoreUpdated',
    type: 'event',
    inputs: [
      { name: 'artisan', type: 'address', indexed: true },
      { name: 'oldScore', type: 'uint256', indexed: false },
      { name: 'newScore', type: 'uint256', indexed: false },
      { name: 'newTier', type: 'uint8', indexed: false },
    ],
  },
] as const

export const ERC20_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
] as const

// EIP-2612 permit ABI — pour USDC (Circle) et ERC20Permit (OZ v5)
export const ERC20_PERMIT_ABI = [
  {
    name: 'nonces',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'owner', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'name',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'string' }],
  },
  {
    name: 'version',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'string' }],
  },
] as const

export const CHANTIER_NFT_ABI = [
  {
    name: 'tokenURI',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ type: 'string' }],
  },
] as const

export const YIELD_PROVIDER_ABI = [
  {
    name: 'pendingYield',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'token', type: 'address' },
      { name: 'principal', type: 'uint256' },
    ],
    outputs: [{ type: 'uint256' }],
  },
] as const

// USDC : 6 décimales
export const TOKEN_DECIMALS = 6
export const AUTO_VALIDATE_DELAY_SEC = 48 * 3600 // 48h en secondes
export const DEPOSIT_RATIO = 1.1 // 110%
