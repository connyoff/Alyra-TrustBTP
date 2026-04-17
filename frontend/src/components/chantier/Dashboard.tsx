'use client'

import { useRouter } from 'next/navigation'
import { Plus, Loader2, HardHat, Home } from 'lucide-react'
import { useAccount } from 'wagmi'
import { useChantiersByAddress } from '@/hooks/useChantiersByAddress'
import { useTrustScore } from '@/hooks/useTrustScore'
import { StatsBar } from './StatsBar'
import { ChantierAccordionCard } from './ChantierAccordionCard'
import { TrustScoreBadge } from './TrustScoreBadge'
import { Button } from '@/components/ui/button'

function RolePill({ isArtisan, isParticulier }: { isArtisan: boolean; isParticulier: boolean }) {
  if (!isArtisan && !isParticulier) return null
  if (isArtisan && isParticulier) {
    return (
      <div className="flex gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-400">
          <HardHat className="size-3" /> Artisan
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-300">
          <Home className="size-3" /> Particulier
        </span>
      </div>
    )
  }
  if (isArtisan) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-400">
        <HardHat className="size-3" /> Mode Artisan
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-300">
      <Home className="size-3" /> Mode Particulier
    </span>
  )
}

export function Dashboard() {
  const { address } = useAccount()
  const router = useRouter()
  const { chantierIds, isLoading, isArtisan, isParticulier } = useChantiersByAddress(address)
  const { stats: trustStats } = useTrustScore(isArtisan ? address : undefined)

  return (
    <div className="space-y-6">
      {/* En-tête identité */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <RolePill isArtisan={isArtisan} isParticulier={isParticulier} />
          {isArtisan && trustStats && (
            <TrustScoreBadge artisanAddress={address} compact />
          )}
        </div>
        {(isArtisan || !isParticulier) && (
          <Button
            onClick={() => router.push('/nouveau-devis')}
            className="bg-[oklch(0.82_0.15_175)] text-black hover:bg-[oklch(0.75_0.15_175)] gap-1.5"
          >
            <Plus className="size-4" /> Nouveau chantier
          </Button>
        )}
      </div>

      {/* Stats */}
      {chantierIds.length > 0 && <StatsBar chantierIds={chantierIds} />}

      {/* En-tête liste */}
      <h2 className="text-xl font-bold tracking-tight">Mes chantiers</h2>

      {/* Liste */}
      {isLoading ? (
        <div className="flex items-center gap-2 text-muted-foreground py-10 justify-center">
          <Loader2 className="size-4 animate-spin" />
          Chargement des chantiers...
        </div>
      ) : chantierIds.length === 0 ? (
        <div className="rounded-xl border border-border/50 bg-card py-16 text-center space-y-3">
          {isArtisan ? (
            <>
              <HardHat className="size-8 text-amber-400/50 mx-auto" />
              <p className="text-muted-foreground text-sm font-medium">Aucun chantier soumis pour le moment.</p>
              <p className="text-xs text-muted-foreground">
                Créez un devis pour un client — définissez les jalons, montants et conditions.
              </p>
              <Button
                onClick={() => router.push('/nouveau-devis')}
                variant="outline"
                className="mt-2"
              >
                <Plus className="size-4 mr-1.5" /> Créer mon premier devis
              </Button>
            </>
          ) : (
            <>
              <Home className="size-8 text-sky-400/50 mx-auto" />
              <p className="text-muted-foreground text-sm font-medium">Aucun chantier en cours.</p>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                Un artisan vous soumettra un devis — vous le retrouverez ici pour le signer et déposer les fonds.
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {chantierIds.map(id => (
            <ChantierAccordionCard
              key={id.toString()}
              chantierId={id}
              walletAddress={address!}
            />
          ))}
        </div>
      )}
    </div>
  )
}
