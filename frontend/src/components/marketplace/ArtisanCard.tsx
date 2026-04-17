'use client'

/**
 * ArtisanCard — carte d'un artisan dans la liste marketplace.
 *
 * Affiche : avatar, nom, société, spécialités, zone, Trust Score (on-chain),
 * avis rating, nombre de chantiers, dispo. Clic → /artisans/[slug]
 */

import Link from 'next/link'
import { Star, MapPin, Check, Circle } from 'lucide-react'
import type { Artisan } from '@/config/artisans'
import { SPECIALTY_LABELS } from '@/config/artisans'

type Props = {
  artisan: Artisan
}

export function ArtisanCard({ artisan }: Props) {
  const {
    slug, name, company, city, postalCode, specialties,
    rating, onChainScore, completedChantiers, yearsExperience,
    tagline, avatarColor, initials, available,
  } = artisan

  // Couleur du score selon le tier
  const scoreColor =
    onChainScore >= 90 ? 'text-[oklch(0.82_0.15_175)] bg-[oklch(0.82_0.15_175)]/10'
    : onChainScore >= 75 ? 'text-green-400 bg-green-400/10'
    : onChainScore >= 60 ? 'text-yellow-400 bg-yellow-400/10'
    : 'text-orange-400 bg-orange-400/10'

  return (
    <Link
      href={`/artisans/${slug}`}
      className="group rounded-2xl border border-border bg-card p-5 flex flex-col
                 hover:border-[oklch(0.82_0.15_175)]/50 hover:-translate-y-1 hover:shadow-lg transition-all"
    >
      {/* Header: avatar + name + dispo */}
      <div className="flex items-start gap-3 mb-3">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-xl text-white font-bold text-lg flex-shrink-0"
          style={{ backgroundColor: avatarColor }}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-base truncate">{company}</div>
          <div className="text-sm text-muted-foreground">{name}</div>
        </div>
        {available ? (
          <span className="inline-flex items-center gap-1 text-xs text-green-400 flex-shrink-0">
            <Circle className="size-2 fill-green-400" /> Dispo
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs text-orange-400 flex-shrink-0">
            <Circle className="size-2 fill-orange-400" /> Occupé
          </span>
        )}
      </div>

      {/* Tagline */}
      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{tagline}</p>

      {/* Specialties pills */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {specialties.slice(0, 3).map((s) => (
          <span
            key={s}
            className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
          >
            {SPECIALTY_LABELS[s]}
          </span>
        ))}
        {specialties.length > 3 && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
            +{specialties.length - 3}
          </span>
        )}
      </div>

      {/* Location */}
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-4">
        <MapPin className="size-4" />
        <span>{city} · {postalCode}</span>
      </div>

      {/* Footer: Trust Score + rating */}
      <div className="mt-auto pt-3 border-t border-border flex items-center justify-between">
        <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${scoreColor}`}>
          <Check className="size-3" />
          Trust Score {onChainScore}
        </div>
        <div className="flex items-center gap-1 text-sm">
          <Star className="size-4 fill-yellow-400 text-yellow-400" />
          <span className="font-semibold">{rating}</span>
          <span className="text-muted-foreground text-xs">({completedChantiers})</span>
        </div>
      </div>
    </Link>
  )
}
