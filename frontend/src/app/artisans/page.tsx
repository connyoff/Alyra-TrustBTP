'use client'

/**
 * /artisans — marketplace : liste d'artisans référencés avec filtres.
 *
 * Les données viennent de src/config/artisans.ts (mock editable).
 * Les filtres sont gérés côté client (pas de fetch serveur).
 */

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Hammer, Plus } from 'lucide-react'
import { ARTISANS } from '@/config/artisans'
import { ArtisanCard } from '@/components/marketplace/ArtisanCard'
import { ArtisanFilters, type Filters } from '@/components/marketplace/ArtisanFilters'

const DEFAULT_FILTERS: Filters = {
  department: '',
  specialties: [],
  minScore: 0,
  onlyAvailable: false,
}

export default function ArtisansPage() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)

  const filtered = useMemo(() => {
    return ARTISANS.filter((a) => {
      if (filters.department && a.department !== filters.department) return false
      if (filters.specialties.length > 0) {
        const hasAny = filters.specialties.some((s) => a.specialties.includes(s))
        if (!hasAny) return false
      }
      if (filters.minScore > 0 && a.onChainScore < filters.minScore) return false
      if (filters.onlyAvailable && !a.available) return false
      return true
    })
  }, [filters])

  return (
    <div className="relative min-h-screen grid-bg">
      <div className="container max-w-6xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[oklch(0.82_0.15_175)]/10 px-3 py-1 text-xs font-semibold text-[oklch(0.82_0.15_175)] mb-2">
              <Hammer className="size-3" /> MARKETPLACE
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight">Artisans référencés</h1>
            <p className="text-muted-foreground mt-1">
              {ARTISANS.length} artisans BTP certifiés, Trust Score on-chain, contact direct.
              Choisis le bon, vous convenez d&apos;un devis, puis vous passez sur Trust BTP pour sécuriser le paiement.
            </p>
          </div>
          <Link
            href="/nouvelle-demande"
            className="inline-flex items-center gap-2 rounded-lg bg-[oklch(0.82_0.15_175)] text-black font-semibold px-4 py-2.5
                       hover:bg-[oklch(0.75_0.15_175)] transition whitespace-nowrap"
          >
            <Plus className="size-4" /> Poster une demande
          </Link>
        </div>

        {/* Layout: filters sidebar + grid */}
        <div className="grid lg:grid-cols-[280px_1fr] gap-6">
          {/* Filters */}
          <aside>
            <ArtisanFilters onChange={setFilters} />
          </aside>

          {/* Results */}
          <div>
            <div className="text-sm text-muted-foreground mb-4">
              {filtered.length} artisan{filtered.length > 1 ? 's' : ''} trouvé{filtered.length > 1 ? 's' : ''}
            </div>

            {filtered.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-card/40 p-10 text-center">
                <div className="text-4xl mb-2">🔎</div>
                <h3 className="font-bold mb-1">Aucun artisan ne correspond</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Essaie d&apos;élargir tes filtres ou poste une demande — des artisans te contacteront.
                </p>
                <Link
                  href="/nouvelle-demande"
                  className="inline-flex items-center gap-2 rounded-lg bg-[oklch(0.82_0.15_175)] text-black font-semibold px-4 py-2
                             hover:bg-[oklch(0.75_0.15_175)] transition"
                >
                  <Plus className="size-4" /> Poster ma demande
                </Link>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {filtered.map((a) => (
                  <ArtisanCard key={a.slug} artisan={a} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Trust note */}
        <div className="mt-12 rounded-2xl border border-border bg-card/40 p-6 text-center">
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            ⓘ Le <strong className="text-foreground">Trust Score</strong> affiché est calculé{' '}
            <strong className="text-foreground">on-chain</strong> à partir de l&apos;historique
            des chantiers complétés et des éventuels litiges. Il ne peut être manipulé par
            l&apos;artisan, ni par Trust BTP.
          </p>
        </div>
      </div>
    </div>
  )
}
