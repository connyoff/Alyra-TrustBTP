'use client'

import { useChantier } from '@/hooks/useChantier'
import { ChantierStatus, JalonStatus } from '@/types/contracts'
import { formatToken, countValidatedJalons } from '@/lib/utils'
import { useMemo } from 'react'

// Calcule les stats agrégées depuis une liste de chantierIds chargés
interface StatsBarProps {
  chantierIds: bigint[]
}

function StatCard({ label, value, alert = false }: { label: string; value: string | number; alert?: boolean }) {
  return (
    <div className={`rounded-xl border bg-card px-5 py-4 flex-1 min-w-0 ${
      alert ? 'border-red-500/30 bg-red-500/5' : 'border-border/50'
    }`}>
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className={`text-2xl font-bold ${alert ? 'text-red-400' : 'text-[oklch(0.82_0.15_175)]'}`}>{value}</div>
    </div>
  )
}

// Composant interne qui lit un chantier et retourne ses stats
function useChantierStats(id: bigint) {
  const { chantier, jalons } = useChantier(id)
  return { chantier, jalons }
}

// Hook agrégateur pour les stats de la barre
export function useAggregatedStats(chantierIds: bigint[]) {
  // On lit les 5 premiers pour ne pas saturer l'UI (le reste est dans l'accordéon)
  const c0 = useChantierStats(chantierIds[0] ?? 0n)
  const c1 = useChantierStats(chantierIds[1] ?? 0n)
  const c2 = useChantierStats(chantierIds[2] ?? 0n)
  const c3 = useChantierStats(chantierIds[3] ?? 0n)
  const c4 = useChantierStats(chantierIds[4] ?? 0n)

  const all = [c0, c1, c2, c3, c4].slice(0, chantierIds.length)

  return useMemo(() => {
    let actifs = 0
    let enEscrow = 0n
    let jalonsDone = 0
    let jalonsTotal = 0
    let litiges = 0

    for (const { chantier, jalons } of all) {
      if (!chantier) continue
      if (chantier.status === ChantierStatus.Active) actifs++
      if (chantier.status === ChantierStatus.Active || chantier.status === ChantierStatus.Paused || chantier.status === ChantierStatus.InLitige) {
        // Soustraire les jalons déjà libérés (Accepted ou ReservesLifted) du dépôt initial
        const released = jalons
          .filter(j => j.status === JalonStatus.Accepted || j.status === JalonStatus.ReservesLifted)
          .reduce((sum, j) => sum + j.amount, 0n)
        enEscrow += chantier.depositAmount - released
      }
      jalonsDone += countValidatedJalons(jalons)
      jalonsTotal += chantier.jalonCount
      if (chantier.status === ChantierStatus.InLitige) litiges++
    }

    return { actifs, enEscrow, jalonsDone, jalonsTotal, litiges }
  }, [all.map(a => a.chantier?.status).join(',')])
}

export function StatsBar({ chantierIds }: StatsBarProps) {
  const { actifs, enEscrow, jalonsDone, jalonsTotal, litiges } = useAggregatedStats(chantierIds)

  if (chantierIds.length === 0) return null

  return (
    <div className="flex gap-3 flex-wrap">
      <StatCard label="Chantiers actifs" value={actifs} />
      <StatCard label="Fonds en escrow" value={formatToken(enEscrow)} />
      <StatCard label="Jalons validés" value={`${jalonsDone} / ${jalonsTotal}`} />
      <StatCard label="Litiges en cours" value={litiges} alert={litiges > 0} />
    </div>
  )
}
