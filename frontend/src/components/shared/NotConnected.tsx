'use client'

/**
 * NotConnected — landing page + routage vers l'onboarding.
 *
 * Sections :
 *   1. Hero                   (avec extraLine DeFi teaser)
 *   2. Marketplace bridge     (CTA Parcourir artisans / Poster demande)
 *   3. Steps "Comment ça fonctionne"
 *   4. Value Proposition      (Artisans / Particuliers)
 *   5. DeFi USP               (nouvelle section)
 *
 * Textes : src/config/content.ts
 */

import { useState } from 'react'
import Link from 'next/link'
import { ShieldCheck, Layers, Zap, Scale, Hammer, FileText, Gift, Sparkles } from 'lucide-react'
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow'
import { CONTENT } from '@/config/content'

export default function NotConnected() {
  const [started, setStarted] = useState(false)

  if (started) {
    return <OnboardingFlow onKycComplete={() => window.location.reload()} />
  }

  const h = CONTENT.hero
  const vp = CONTENT.valueProposition
  const loyalty = CONTENT.loyaltyBenefits
  const trustIcons = [ShieldCheck, Layers, Zap, Scale]

  return (
    <div className="grid-bg min-h-[calc(100vh-65px)]">
      {/* ============================= HERO ============================= */}
      <section className="relative py-24 px-4 text-center">
        <div className="absolute inset-0 flex items-start justify-center pointer-events-none">
          <div className="w-[600px] h-[300px] rounded-full bg-[oklch(0.82_0.15_175)]/10 blur-3xl" />
        </div>
        <div className="relative container max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-[oklch(0.82_0.15_175)]/30 bg-[oklch(0.82_0.15_175)]/10 px-4 py-1.5 text-sm text-[oklch(0.82_0.15_175)]">
            <ShieldCheck className="size-4" /> {h.badge}
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-tight">
            {h.title.line1}<br />
            {h.title.line2Prefix}{' '}
            <span className="text-[oklch(0.82_0.15_175)]">{h.title.line2Middle}</span>
            {h.title.line2Suffix && ' ' + h.title.line2Suffix}
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            {h.subtitle}
          </p>
          {h.extraLine && (
            <p className="text-base text-[oklch(0.82_0.15_175)] italic font-medium max-w-xl mx-auto">
              {h.extraLine}
            </p>
          )}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => setStarted(true)}
              className="rounded-full bg-[oklch(0.82_0.15_175)] text-black font-semibold px-8 py-3
                         hover:bg-[oklch(0.75_0.15_175)] transition-colors text-lg"
            >
              {h.ctaPrimary} →
            </button>
            <Link
              href="/artisans"
              className="rounded-full border border-[oklch(0.82_0.15_175)]/40 text-[oklch(0.82_0.15_175)] font-semibold px-8 py-3
                         hover:bg-[oklch(0.82_0.15_175)]/5 transition-colors text-lg"
            >
              {h.ctaSecondary}
            </Link>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-sm text-muted-foreground">
            {h.trustItems.map((label, i) => {
              const Icon = trustIcons[i] ?? ShieldCheck
              return (
                <div key={label} className="flex items-center gap-1.5">
                  <Icon className="size-4 text-[oklch(0.82_0.15_175)]" />
                  <span>{label}</span>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ============================= MARKETPLACE BRIDGE ============================= */}
      <section className="py-16 px-4">
        <div className="container max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-3">
            Trouver votre artisan{' '}
            <span className="text-[oklch(0.82_0.15_175)]">en 2 minutes</span>
          </h2>
          <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-10">
            Consultez notre référentiel d&apos;artisans certifiés, filtrés par zone et par
            compétence. Contact direct, aucune commission cachée.
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            <Link
              href="/artisans"
              className="group rounded-2xl border-2 border-[oklch(0.82_0.15_175)]/30 bg-card p-6
                         hover:border-[oklch(0.82_0.15_175)] hover:-translate-y-1 transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[oklch(0.82_0.15_175)]/10">
                  <Hammer className="size-6 text-[oklch(0.82_0.15_175)]" />
                </div>
                <div>
                  <div className="font-bold text-lg">Parcourir les artisans</div>
                  <div className="text-sm text-muted-foreground">
                    Filtrer par zone et compétence
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Artisans référencés · notation vérifiée · certifications
                (décennale, RGE, Qualibat).
              </p>
              <div className="mt-4 text-sm font-semibold text-[oklch(0.82_0.15_175)]">
                Voir les artisans →
              </div>
            </Link>

            <Link
              href="/nouvelle-demande"
              className="group rounded-2xl border-2 border-purple-500/30 bg-card p-6
                         hover:border-purple-500 hover:-translate-y-1 transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10">
                  <FileText className="size-6 text-purple-400" />
                </div>
                <div>
                  <div className="font-bold text-lg">Poster une demande</div>
                  <div className="text-sm text-muted-foreground">
                    Laissez les artisans venir à vous
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Décrivez votre projet · les artisans correspondant à votre zone et à vos
                besoins vous contacteront directement.
              </p>
              <div className="mt-4 text-sm font-semibold text-purple-400">
                Poster ma demande →
              </div>
            </Link>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Une fois que vous avez trouvé le bon artisan et convenu d&apos;un devis, Trust BTP sécurise le paiement.
          </p>
        </div>
      </section>

      {/* ============================= STEPS ============================= */}
      <section className="py-16 px-4">
        <div className="container max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            {CONTENT.steps.title}{' '}
            <span className="text-[oklch(0.82_0.15_175)]">
              {CONTENT.steps.titleHighlight}
            </span>
          </h2>
          <div className="grid sm:grid-cols-4 gap-6">
            {CONTENT.steps.list.map(({ num, title, desc }, i) => (
              <div key={num} className="relative text-center space-y-3">
                {i < CONTENT.steps.list.length - 1 && (
                  <div className="hidden sm:block absolute top-5 left-1/2 w-full h-px bg-gradient-to-r from-[oklch(0.82_0.15_175)]/40 to-transparent" />
                )}
                <div className="text-5xl font-black text-[oklch(0.82_0.15_175)]/20 leading-none">{num}</div>
                <h3 className="font-semibold text-sm">{title}</h3>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================= VALUE PROPOSITION ============================= */}
      <section className="py-16 px-4">
        <div className="container max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10">{vp.title}</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {/* Artisans */}
            <div className="rounded-2xl border border-purple-500/20 bg-card p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10">
                  <Zap className="size-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">{vp.artisan.title}</h3>
                  <p className="text-xs text-muted-foreground">{vp.artisan.subtitle}</p>
                </div>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {vp.artisan.points.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5 flex-shrink-0">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Particuliers */}
            <div className="rounded-2xl border border-[oklch(0.82_0.15_175)]/20 bg-card p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[oklch(0.82_0.15_175)]/10">
                  <ShieldCheck className="size-5 text-[oklch(0.82_0.15_175)]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">{vp.particulier.title}</h3>
                  <p className="text-xs text-muted-foreground">{vp.particulier.subtitle}</p>
                </div>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {vp.particulier.points.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="text-[oklch(0.82_0.15_175)] mt-0.5 flex-shrink-0">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ============================= LOYALTY BENEFITS ============================= */}
      <section className="py-16 px-4 pb-24">
        <div className="container max-w-4xl mx-auto">
          <div className="rounded-3xl border border-[oklch(0.82_0.15_175)]/20 bg-gradient-to-br from-[oklch(0.82_0.15_175)]/5 to-purple-500/5 p-10">
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[oklch(0.82_0.15_175)]/15 flex-shrink-0">
                <Gift className="size-7 text-[oklch(0.82_0.15_175)]" />
              </div>
              <div className="flex-1 space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full bg-[oklch(0.82_0.15_175)]/10 px-3 py-1 text-xs font-semibold text-[oklch(0.82_0.15_175)]">
                  <Sparkles className="size-3" /> BONUS
                </div>
                <h2 className="text-3xl font-extrabold leading-tight">{loyalty.title}</h2>
                <p className="text-base text-muted-foreground">{loyalty.subtitle}</p>
                <ul className="grid sm:grid-cols-2 gap-3 pt-2">
                  {loyalty.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm">
                      <span className="text-[oklch(0.82_0.15_175)] mt-0.5 flex-shrink-0">✓</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                {loyalty.note && (
                  <p className="text-xs text-muted-foreground italic pt-2 border-t border-[oklch(0.82_0.15_175)]/10">
                    {loyalty.note}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
