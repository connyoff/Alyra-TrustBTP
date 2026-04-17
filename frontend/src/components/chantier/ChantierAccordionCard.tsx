'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, ChevronUp, ExternalLink, Clock } from 'lucide-react'
import { useChantier } from '@/hooks/useChantier'
import { useJalonActions } from '@/hooks/useJalonActions'
import { ChantierStatus, JalonStatus } from '@/types/contracts'
import { formatToken, shortAddress, hashProof, countValidatedJalons, timeUntilAutoValidation } from '@/lib/utils'
import { ChantierStatusBadge } from './StatusBadge'
import { JalonRow } from './JalonRow'
import { Button } from '@/components/ui/button'

interface ChantierAccordionCardProps {
  chantierId: bigint
  walletAddress: `0x${string}`
  defaultOpen?: boolean
}

export function ChantierAccordionCard({ chantierId, walletAddress, defaultOpen = false }: ChantierAccordionCardProps) {
  const [open, setOpen] = useState(defaultOpen)
  const router = useRouter()
  const { chantier, jalons, refetch } = useChantier(chantierId)
  const actions = useJalonActions(refetch)

  if (!chantier) {
    return (
      <div className="rounded-xl border border-border/50 bg-card p-4 animate-pulse h-20" />
    )
  }

  const role = chantier.artisan.toLowerCase() === walletAddress.toLowerCase()
    ? 'artisan'
    : chantier.particulier.toLowerCase() === walletAddress.toLowerCase()
      ? 'particulier'
      : 'viewer'

  const validated = countValidatedJalons(jalons)
  const progress = chantier.jalonCount > 0 ? (validated / chantier.jalonCount) * 100 : 0
  const fullTitle = chantier.name || jalons[0]?.description || `Chantier #${chantierId}`
  const title = fullTitle.length > 35 ? fullTitle.slice(0, 35) + '…' : fullTitle

  // Labels contextuels selon le rôle
  const counterpartLabel = role === 'artisan' ? 'Client' : role === 'particulier' ? 'Artisan' : 'Partie'
  const counterpartAddress = role === 'artisan' ? chantier.particulier : chantier.artisan
  const counterpartDisplay = `${counterpartLabel} → ${shortAddress(counterpartAddress)}`

  // Timer 48h sur le jalon courant
  const currentJalon = jalons[chantier.currentJalonIndex]
  const autoVal = currentJalon?.status === JalonStatus.Finished
    ? timeUntilAutoValidation(currentJalon.finishedAt)
    : null
  const hasUrgentTimer = autoVal !== null

  async function handleValidateJalon() {
    const proof = await hashProof(`proof-${chantierId}-${chantier!.currentJalonIndex}-${Date.now()}`)
    actions.validateJalon(chantierId, proof)
  }

  return (
    <div className={`rounded-xl border bg-card overflow-hidden transition-all ${
      hasUrgentTimer
        ? 'border-amber-500/40'
        : 'border-border/50'
    }`}>
      {/* En-tête cliquable */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex flex-col items-start gap-1 text-left">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-foreground" title={fullTitle}>{title}</span>
            <span className="text-xs text-muted-foreground">#{chantierId.toString()}</span>
            <ChantierStatusBadge status={chantier.status} />
            {/* Badge urgence timer 48h */}
            {hasUrgentTimer && (
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                autoVal!.expired
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              }`}>
                <Clock className="size-3" />
                {autoVal!.expired ? 'Auto-val. dispo' : autoVal!.label}
              </span>
            )}
          </div>
          <span className="text-xs text-muted-foreground">{counterpartDisplay}</span>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className={`font-bold ${
            chantier.status === ChantierStatus.Completed
              ? 'text-[oklch(0.82_0.15_175)]'
              : chantier.status === ChantierStatus.Active
                ? 'text-sky-300'
                : 'text-muted-foreground'
          }`}>
            {formatToken(chantier.devisAmount)}
          </span>
          {open ? <ChevronUp className="size-4 text-muted-foreground" /> : <ChevronDown className="size-4 text-muted-foreground" />}
        </div>
      </button>

      {/* Barre de progression */}
      <div className="px-5 pb-2">
        <div className="h-0.5 w-full rounded-full bg-white/5">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              chantier.status === ChantierStatus.Completed
                ? 'bg-[oklch(0.82_0.15_175)]'
                : 'bg-sky-400/80'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {validated}/{chantier.jalonCount} jalons validés
          </span>
          {chantier.status === ChantierStatus.Active && chantier.yieldOptIn && (
            <span className="text-xs text-teal-400">⚡ Yield actif</span>
          )}
        </div>
      </div>

      {/* Jalons dépliés */}
      {open && (
        <div className="px-5 pb-4 border-t border-border/30 pt-3 space-y-0.5">
          {jalons.map((jalon, idx) => (
            <JalonRow
              key={idx}
              jalon={jalon}
              index={idx}
              isCurrent={idx === chantier.currentJalonIndex && chantier.status === ChantierStatus.Active}
              role={role}
              chantierId={chantierId}
              devisAmount={chantier.devisAmount}
              onValidate={handleValidateJalon}
              onAccept={() => actions.acceptJalon(chantierId)}
              onTriggerAuto={() => actions.triggerAutoValidation(chantierId)}
              onOpenDetail={() => router.push(`/chantier/${chantierId}`)}
            />
          ))}

          {/* Actions chantier */}
          <div className="flex items-center justify-between pt-3 border-t border-border/20 mt-2">
            <div className="flex gap-2">
              {/* Accepter le devis (particulier) */}
              {role === 'particulier' && chantier.status === ChantierStatus.DevisSubmitted && (
                <Button
                  size="sm"
                  className="bg-[oklch(0.82_0.15_175)] text-black hover:bg-[oklch(0.75_0.15_175)]"
                  onClick={() => router.push(`/chantier/${chantierId}`)}
                >
                  Voir le devis
                </Button>
              )}
              {/* Annuler (particulier, avant 1er jalon) */}
              {role === 'particulier' &&
                chantier.status === ChantierStatus.Active &&
                chantier.currentJalonIndex === 0 &&
                jalons[0]?.status === JalonStatus.Pending && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => actions.cancelChantier(chantierId)}
                    disabled={actions.isPending}
                  >
                    Annuler
                  </Button>
                )}
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => router.push(`/chantier/${chantierId}`)}
              className="text-muted-foreground gap-1"
            >
              Détails <ExternalLink className="size-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
