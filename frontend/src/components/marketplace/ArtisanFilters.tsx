'use client'

/**
 * ArtisanFilters — filtres marketplace :
 *   - Zone (département)
 *   - Compétences (multi-select spécialités)
 *   - Trust Score minimum
 *   - Disponibilité
 *
 * Callback onChange(filters) : renvoie l'état courant au parent.
 */

import { useState } from 'react'
import { Filter, X } from 'lucide-react'
import {
  DEPARTMENTS_AVAILABLE,
  SPECIALTY_LABELS,
  type Specialty,
} from '@/config/artisans'

export type Filters = {
  department: string             // '75', '92'... ou '' pour tous
  specialties: Specialty[]       // [] pour toutes
  minScore: number               // 0-100
  onlyAvailable: boolean
}

const DEFAULT_FILTERS: Filters = {
  department: '',
  specialties: [],
  minScore: 0,
  onlyAvailable: false,
}

type Props = {
  onChange: (f: Filters) => void
}

const ALL_SPECIALTIES = Object.keys(SPECIALTY_LABELS) as Specialty[]

export function ArtisanFilters({ onChange }: Props) {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)

  function update(patch: Partial<Filters>) {
    const next = { ...filters, ...patch }
    setFilters(next)
    onChange(next)
  }

  function toggleSpecialty(s: Specialty) {
    update({
      specialties: filters.specialties.includes(s)
        ? filters.specialties.filter((x) => x !== s)
        : [...filters.specialties, s],
    })
  }

  function reset() {
    setFilters(DEFAULT_FILTERS)
    onChange(DEFAULT_FILTERS)
  }

  const hasActiveFilters =
    filters.department !== '' ||
    filters.specialties.length > 0 ||
    filters.minScore > 0 ||
    filters.onlyAvailable

  return (
    <div className="rounded-2xl border border-border bg-card p-5 sticky top-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 font-bold">
          <Filter className="size-4 text-[oklch(0.82_0.15_175)]" /> Filtres
        </div>
        {hasActiveFilters && (
          <button
            onClick={reset}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <X className="size-3" /> Effacer
          </button>
        )}
      </div>

      {/* ----- Zone géographique ----- */}
      <div className="mb-5">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
          Zone géographique
        </label>
        <select
          value={filters.department}
          onChange={(e) => update({ department: e.target.value })}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm
                     focus:outline-none focus:border-[oklch(0.82_0.15_175)]"
        >
          <option value="">Tous les départements</option>
          {DEPARTMENTS_AVAILABLE.map((d) => (
            <option key={d.code} value={d.code}>
              {d.code} · {d.name}
            </option>
          ))}
        </select>
      </div>

      {/* ----- Compétences ----- */}
      <div className="mb-5">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
          Compétences
        </label>
        <div className="flex flex-wrap gap-1.5">
          {ALL_SPECIALTIES.map((s) => {
            const active = filters.specialties.includes(s)
            return (
              <button
                key={s}
                onClick={() => toggleSpecialty(s)}
                className={`text-xs px-2.5 py-1 rounded-full transition
                  ${active
                    ? 'bg-[oklch(0.82_0.15_175)] text-black font-semibold'
                    : 'bg-muted text-muted-foreground hover:bg-muted/60'}`}
              >
                {SPECIALTY_LABELS[s]}
              </button>
            )
          })}
        </div>
      </div>

      {/* ----- Trust Score minimum ----- */}
      <div className="mb-5">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-2">
          Trust Score minimum : <span className="text-[oklch(0.82_0.15_175)]">{filters.minScore}</span>
        </label>
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={filters.minScore}
          onChange={(e) => update({ minScore: Number(e.target.value) })}
          className="w-full accent-[oklch(0.82_0.15_175)]"
        />
        <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
          <span>0</span>
          <span>50</span>
          <span>100</span>
        </div>
      </div>

      {/* ----- Disponibilité ----- */}
      <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
        <input
          type="checkbox"
          checked={filters.onlyAvailable}
          onChange={(e) => update({ onlyAvailable: e.target.checked })}
          className="size-4 accent-[oklch(0.82_0.15_175)]"
        />
        <span>Seulement les artisans disponibles</span>
      </label>
    </div>
  )
}
