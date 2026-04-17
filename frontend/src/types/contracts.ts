// Types TypeScript alignés sur les structs Solidity de DataTypes.sol

export enum ChantierStatus {
  DevisSubmitted = 0,
  DevisRejected = 1,
  Active = 2,
  Paused = 3,
  InLitige = 4,
  Completed = 5,
  Cancelled = 6,
}

export enum JalonStatus {
  Pending = 0,
  Finished = 1,
  Accepted = 2,
  AcceptedWithReserves = 3,
  PaidWithReserves = 4,
  InLitige = 5,
  ReservesLifted = 6,
}

export enum TrustTier {
  Nouveau = 0,
  Confirme = 1,
  Expert = 2,
  Elite = 3,
}

export interface Chantier {
  id: bigint
  name: string
  artisan: `0x${string}`
  particulier: `0x${string}`
  token: `0x${string}`
  devisAmount: bigint
  depositAmount: bigint
  yieldOptIn: boolean
  status: ChantierStatus
  currentJalonIndex: number
  jalonCount: number
  submittedAt: bigint
  acceptedAt: bigint
  completedAt: bigint
}

export interface Jalon {
  description: string
  amount: bigint
  status: JalonStatus
  finishedAt: bigint
  artisanProofHash: `0x${string}`
  clientProofHash: `0x${string}`
  blockedAmount: bigint
  penaltyAmount: bigint
  deadline: bigint
}

export interface TrustStats {
  score: bigint
  tier: TrustTier
  chantiersCompleted: bigint
  litigesCount: bigint
  frozen: boolean
}

// Labels lisibles
export const CHANTIER_STATUS_LABEL: Record<ChantierStatus, string> = {
  [ChantierStatus.DevisSubmitted]: 'Devis en attente',
  [ChantierStatus.DevisRejected]: 'Devis refusé',
  [ChantierStatus.Active]: 'En cours',
  [ChantierStatus.Paused]: 'En pause',
  [ChantierStatus.InLitige]: 'En litige',
  [ChantierStatus.Completed]: 'Terminé',
  [ChantierStatus.Cancelled]: 'Annulé',
}

export const JALON_STATUS_LABEL: Record<JalonStatus, string> = {
  [JalonStatus.Pending]: 'En attente',
  [JalonStatus.Finished]: 'Preuve soumise',
  [JalonStatus.Accepted]: 'Validé',
  [JalonStatus.AcceptedWithReserves]: 'Réserves posées',
  [JalonStatus.PaidWithReserves]: 'Payé avec réserves',
  [JalonStatus.InLitige]: 'En litige',
  [JalonStatus.ReservesLifted]: 'Réserves levées',
}

export const TRUST_TIER_LABEL: Record<TrustTier, string> = {
  [TrustTier.Nouveau]: 'Nouveau',
  [TrustTier.Confirme]: 'Confirmé',
  [TrustTier.Expert]: 'Expert',
  [TrustTier.Elite]: 'Élite',
}
