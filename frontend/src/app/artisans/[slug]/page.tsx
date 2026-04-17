'use client'

/**
 * /artisans/[slug] — fiche détaillée d'un artisan.
 *
 * Affiche : profil complet, certifications, Trust Score on-chain,
 * spécialités, bio. CTA = contacter + proposer un devis.
 */

import { use } from 'react'
import Link from 'next/link'
import { ArrowLeft, MapPin, Star, Check, Circle, Shield, Phone, Mail } from 'lucide-react'
import { notFound } from 'next/navigation'
import { ARTISANS, SPECIALTY_LABELS } from '@/config/artisans'

type Props = {
  params: Promise<{ slug: string }>
}

export default function ArtisanDetailPage({ params }: Props) {
  const { slug } = use(params)
  const artisan = ARTISANS.find((a) => a.slug === slug)

  if (!artisan) notFound()

  const scoreColor =
    artisan.onChainScore >= 90 ? 'text-[oklch(0.82_0.15_175)] bg-[oklch(0.82_0.15_175)]/10'
    : artisan.onChainScore >= 75 ? 'text-green-400 bg-green-400/10'
    : artisan.onChainScore >= 60 ? 'text-yellow-400 bg-yellow-400/10'
    : 'text-orange-400 bg-orange-400/10'

  const tier =
    artisan.onChainScore >= 90 ? 'Élite'
    : artisan.onChainScore >= 75 ? 'Confirmé'
    : artisan.onChainScore >= 60 ? 'Vérifié'
    : 'Débutant'

  return (
    <div className="grid-bg min-h-screen">
      <div className="container max-w-5xl mx-auto px-4 py-10">
        <Link
          href="/artisans"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition mb-6"
        >
          <ArrowLeft className="size-4" /> Retour à la liste
        </Link>

        <div className="grid md:grid-cols-[1.4fr_1fr] gap-6">
          {/* ============ MAIN COLUMN ============ */}
          <div className="space-y-6">
            {/* Header */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-start gap-4 mb-4">
                <div
                  className="flex h-20 w-20 items-center justify-center rounded-2xl text-white font-bold text-2xl flex-shrink-0"
                  style={{ backgroundColor: artisan.avatarColor }}
                >
                  {artisan.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-extrabold">{artisan.company}</h1>
                  <p className="text-muted-foreground">{artisan.name}</p>
                  <p className="text-sm text-muted-foreground mt-1">{artisan.tagline}</p>
                </div>
                {artisan.available ? (
                  <span className="inline-flex items-center gap-1 text-sm text-green-400 flex-shrink-0">
                    <Circle className="size-2 fill-green-400" /> Disponible
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-sm text-orange-400 flex-shrink-0">
                    <Circle className="size-2 fill-orange-400" /> Occupé
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3 py-3 border-y border-border">
                <Stat label="Chantiers" value={artisan.completedChantiers} />
                <Stat label="Années exp." value={artisan.yearsExperience} />
                <Stat label="Avis clients" value={`${artisan.rating} / 5`} icon="star" />
              </div>

              <div className="flex flex-wrap gap-3 pt-4 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-4" />
                  {artisan.city} · {artisan.postalCode}
                </span>
                <span>· Intervention {artisan.radiusKm} km autour</span>
              </div>
            </div>

            {/* Bio */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-bold mb-2">Présentation</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{artisan.bio}</p>
            </div>

            {/* Specialties */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-bold mb-3">Spécialités</h2>
              <div className="flex flex-wrap gap-2">
                {artisan.specialties.map((s) => (
                  <span
                    key={s}
                    className="rounded-full bg-[oklch(0.82_0.15_175)]/10 text-[oklch(0.82_0.15_175)] px-3 py-1.5 text-sm font-semibold"
                  >
                    {SPECIALTY_LABELS[s]}
                  </span>
                ))}
              </div>
            </div>

            {/* Certifications */}
            <div className="rounded-2xl border border-border bg-card p-6">
              <h2 className="font-bold mb-3 flex items-center gap-2">
                <Shield className="size-4 text-[oklch(0.82_0.15_175)]" /> Certifications &amp; assurances
              </h2>
              <ul className="space-y-2 text-sm">
                {artisan.certifications.map((c) => (
                  <li key={c} className="flex items-center gap-2">
                    <Check className="size-4 text-[oklch(0.82_0.15_175)]" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ============ SIDE COLUMN ============ */}
          <div className="space-y-6">
            {/* Trust Score highlight */}
            <div className="rounded-2xl bg-[oklch(0.15_0.03_250)] text-white p-6 text-center">
              <div className="text-xs font-bold uppercase tracking-wider text-[oklch(0.82_0.15_175)] mb-2">
                Trust Score on-chain
              </div>
              <div className="text-6xl font-black my-2">{artisan.onChainScore}</div>
              <div className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${scoreColor}`}>
                Tier : {tier}
              </div>
              <p className="text-xs text-white/60 mt-3">
                Score calculé à partir des chantiers validés et éventuels litiges on-chain.
                Source : <code className="text-[oklch(0.82_0.15_175)]">TrustScoreRegistry.sol</code>
              </p>
              <div className="flex items-center justify-center gap-1 text-xs text-white/60 mt-2">
                <Star className="size-3 fill-yellow-400 text-yellow-400" />
                Avis clients : {artisan.rating} / 5 ({artisan.completedChantiers} avis)
              </div>
            </div>

            {/* Pricing */}
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Tarif indicatif
              </div>
              <div className="text-2xl font-bold">{artisan.avgPrice}</div>
              <p className="text-xs text-muted-foreground mt-2">
                Fourchette indicative. Devis précis à obtenir directement.
              </p>
            </div>

            {/* CTA */}
            <div className="rounded-2xl border border-[oklch(0.82_0.15_175)]/30 bg-[oklch(0.82_0.15_175)]/5 p-5 space-y-3">
              <h3 className="font-bold">Contacter cet artisan</h3>
              <p className="text-xs text-muted-foreground">
                Prenez contact, obtenez un devis, puis sécurisez le paiement avec Trust BTP.
              </p>
              <button className="w-full flex items-center justify-center gap-2 rounded-lg bg-[oklch(0.82_0.15_175)] text-black font-semibold py-2.5 hover:bg-[oklch(0.75_0.15_175)] transition">
                <Phone className="size-4" /> Obtenir ses coordonnées
              </button>
              <button className="w-full flex items-center justify-center gap-2 rounded-lg border border-border py-2.5 text-sm hover:border-[oklch(0.82_0.15_175)]/50 transition">
                <Mail className="size-4" /> Envoyer un message
              </button>
              <Link
                href="/nouveau-devis"
                className="block w-full text-center rounded-lg bg-purple-500/10 text-purple-400 font-semibold py-2.5 text-sm hover:bg-purple-500/20 transition"
              >
                → Proposer un devis Trust BTP
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value, icon }: { label: string; value: string | number; icon?: 'star' }) {
  return (
    <div className="text-center">
      <div className="text-xl font-bold flex items-center justify-center gap-1">
        {icon === 'star' && <Star className="size-4 fill-yellow-400 text-yellow-400" />}
        {value}
      </div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  )
}
