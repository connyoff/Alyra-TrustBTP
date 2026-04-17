'use client'

import { CheckCircle2, Clock, AlertTriangle, ShieldCheck, ShieldAlert, MinusCircle, Calendar } from 'lucide-react'
import { Jalon, JalonStatus } from '@/types/contracts'
import { formatToken, formatDeadline, timeUntilAutoValidation } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { JalonStatusLabel } from './StatusBadge'

interface JalonRowProps {
  jalon: Jalon
  index: number
  isCurrent: boolean
  role: 'artisan' | 'particulier' | 'arbitre' | 'viewer'
  chantierId: bigint
  devisAmount?: bigint
  onValidate?: () => void
  onAccept?: () => void
  onTriggerAuto?: () => void
  onOpenDetail?: () => void
}

const JALON_ICON: Record<JalonStatus, React.ReactNode> = {
  [JalonStatus.Pending]: <MinusCircle className="size-4 text-zinc-600" />,
  [JalonStatus.Finished]: <Clock className="size-4 text-blue-400" />,
  [JalonStatus.Accepted]: <CheckCircle2 className="size-4 text-emerald-400" />,
  [JalonStatus.AcceptedWithReserves]: <AlertTriangle className="size-4 text-amber-400" />,
  [JalonStatus.PaidWithReserves]: <ShieldAlert className="size-4 text-amber-300" />,
  [JalonStatus.InLitige]: <AlertTriangle className="size-4 text-red-400" />,
  [JalonStatus.ReservesLifted]: <ShieldCheck className="size-4 text-teal-400" />,
}

export function JalonRow({ jalon, index, isCurrent, role, chantierId, devisAmount, onValidate, onAccept, onTriggerAuto, onOpenDetail }: JalonRowProps) {
  const pct = devisAmount && devisAmount > 0n
    ? Math.round((Number(jalon.amount) / Number(devisAmount)) * 100)
    : null

  const autoVal = jalon.status === JalonStatus.Finished ? timeUntilAutoValidation(jalon.finishedAt) : null

  return (
    <div className="flex items-center justify-between py-2.5 px-2 rounded-lg hover:bg-white/[0.02] transition-colors">
      <div className="flex items-center gap-3">
        <span className="flex-shrink-0">{JALON_ICON[jalon.status]}</span>
        <div>
          <span className="text-sm text-foreground/90">{jalon.description}</span>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-xs text-muted-foreground">
              {pct !== null && <span className="text-muted-foreground/70">{pct}% — </span>}
              {formatToken(jalon.amount)}
            </span>
            {jalon.deadline > 0n && (
              <span className={`inline-flex items-center gap-1 text-xs ${
                jalon.deadline < BigInt(Math.floor(Date.now() / 1000)) &&
                jalon.status !== JalonStatus.Accepted &&
                jalon.status !== JalonStatus.ReservesLifted
                  ? 'text-amber-400'
                  : 'text-muted-foreground/70'
              }`}>
                <Calendar className="size-3" />
                {formatDeadline(jalon.deadline)}
              </span>
            )}
            {jalon.status === JalonStatus.Finished && autoVal && (
              <span className={`text-xs ${autoVal.expired ? 'text-emerald-400' : 'text-blue-400'}`}>
                · {autoVal.label}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Actions inline — seulement pour le jalon courant */}
        {isCurrent && role === 'artisan' && jalon.status === JalonStatus.Pending && onValidate && (
          <Button size="sm" onClick={onValidate} className="bg-[oklch(0.82_0.15_175)] text-black hover:bg-[oklch(0.75_0.15_175)]">
            Demander paiement
          </Button>
        )}
        {isCurrent && role === 'artisan' && jalon.status === JalonStatus.AcceptedWithReserves && onOpenDetail && (
          <Button size="sm" variant="outline" onClick={onOpenDetail}>
            Répondre
          </Button>
        )}
        {isCurrent && role === 'particulier' && jalon.status === JalonStatus.Finished && onAccept && (
          <>
            <Button size="sm" onClick={onAccept} className="bg-[oklch(0.82_0.15_175)] text-black hover:bg-[oklch(0.75_0.15_175)]">
              Valider
            </Button>
            {onOpenDetail && (
              <Button size="sm" variant="outline" onClick={onOpenDetail}>Réserves</Button>
            )}
          </>
        )}
        {isCurrent && jalon.status === JalonStatus.Finished && autoVal?.expired && onTriggerAuto && (
          <Button size="sm" variant="outline" onClick={onTriggerAuto}>
            Auto-valider
          </Button>
        )}
        {isCurrent && role === 'particulier' && jalon.status === JalonStatus.PaidWithReserves && onOpenDetail && (
          <Button size="sm" onClick={onOpenDetail} className="bg-[oklch(0.82_0.15_175)] text-black hover:bg-[oklch(0.75_0.15_175)]">
            Lever réserves
          </Button>
        )}

        {/* Statut texte */}
        {jalon.status !== JalonStatus.Pending && (
          <JalonStatusLabel status={jalon.status} />
        )}
        {jalon.status === JalonStatus.Pending && !isCurrent && (
          <span className="text-xs text-muted-foreground">En attente</span>
        )}
      </div>
    </div>
  )
}
