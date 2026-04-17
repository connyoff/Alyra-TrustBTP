import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { TOKEN_DECIMALS } from "./contracts"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Formate un montant bigint USDC (6 décimales) en string lisible
export function formatToken(amount: bigint, withSymbol = true): string {
  const value = Number(amount) / Math.pow(10, TOKEN_DECIMALS)
  const formatted = value.toLocaleString('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
  return withSymbol ? `${formatted} USDC` : formatted
}

// Tronque une adresse Ethereum : 0x1234...5678
export function shortAddress(address: string): string {
  if (!address || address.length < 10) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

// Convertit un montant USDC en chaîne vers bigint (6 décimales)
export function parseToken(value: string): bigint {
  const num = parseFloat(value.replace(',', '.'))
  if (isNaN(num) || num < 0) return 0n
  return BigInt(Math.round(num * Math.pow(10, TOKEN_DECIMALS)))
}

// Formate un timestamp Unix (bigint) en date courte française — ex: "15 jan. 2026"
export function formatDeadline(deadline: bigint): string {
  if (!deadline) return ''
  return new Date(Number(deadline) * 1000).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

// Durée restante avant auto-validation (retourne null si expirée)
export function timeUntilAutoValidation(finishedAt: bigint): { expired: boolean; label: string } {
  const delay = 48 * 3600
  const availableAt = Number(finishedAt) + delay
  const now = Math.floor(Date.now() / 1000)
  const remaining = availableAt - now

  if (remaining <= 0) return { expired: true, label: 'Délai expiré' }

  const h = Math.floor(remaining / 3600)
  const m = Math.floor((remaining % 3600) / 60)
  return { expired: false, label: `${h}h ${m}min restantes` }
}

// Calcule le nombre de jalons validés (Accepted, ReservesLifted)
export function countValidatedJalons(jalons: { status: number }[]): number {
  return jalons.filter(j => j.status === 2 || j.status === 6).length
}

// Hash keccak256 d'une chaîne — utilisé pour les proofHash
export async function hashProof(input: string): Promise<`0x${string}`> {
  const { keccak256, toHex } = await import('viem')
  return keccak256(toHex(input))
}
