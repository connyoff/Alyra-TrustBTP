import { cn } from '@/lib/utils'
import { ChantierStatus, JalonStatus, CHANTIER_STATUS_LABEL, JALON_STATUS_LABEL } from '@/types/contracts'

const CHANTIER_COLORS: Record<ChantierStatus, string> = {
  [ChantierStatus.DevisSubmitted]: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  [ChantierStatus.DevisRejected]: 'bg-red-500/15 text-red-400 border-red-500/20',
  [ChantierStatus.Active]: 'bg-sky-500/15 text-sky-300 border-sky-500/20',
  [ChantierStatus.Paused]: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  [ChantierStatus.InLitige]: 'bg-red-500/15 text-red-400 border-red-500/20',
  [ChantierStatus.Completed]: 'bg-teal-500/15 text-teal-400 border-teal-500/20',
  [ChantierStatus.Cancelled]: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/20',
}

const JALON_BADGE_COLORS: Record<JalonStatus, string> = {
  [JalonStatus.Pending]: 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20',
  [JalonStatus.Finished]: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  [JalonStatus.Accepted]: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  [JalonStatus.AcceptedWithReserves]: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  [JalonStatus.PaidWithReserves]: 'bg-amber-500/10 text-amber-300 border border-amber-400/20',
  [JalonStatus.InLitige]: 'bg-red-500/10 text-red-400 border border-red-500/20',
  [JalonStatus.ReservesLifted]: 'bg-teal-500/10 text-teal-400 border border-teal-500/20',
}

export function ChantierStatusBadge({ status }: { status: ChantierStatus }) {
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium', CHANTIER_COLORS[status])}>
      {CHANTIER_STATUS_LABEL[status]}
    </span>
  )
}

const JALON_STATUS_LABELS: Record<JalonStatus, string> = {
  [JalonStatus.Pending]: 'En attente',
  [JalonStatus.Finished]: 'Preuve soumise',
  [JalonStatus.Accepted]: 'Validé',
  [JalonStatus.AcceptedWithReserves]: 'Avec réserves',
  [JalonStatus.PaidWithReserves]: 'Payé partiellement',
  [JalonStatus.InLitige]: 'En litige',
  [JalonStatus.ReservesLifted]: 'Réserves levées',
}

export function JalonStatusLabel({ status }: { status: JalonStatus }) {
  return (
    <span className={cn('inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium', JALON_BADGE_COLORS[status])}>
      {JALON_STATUS_LABELS[status]}
    </span>
  )
}
