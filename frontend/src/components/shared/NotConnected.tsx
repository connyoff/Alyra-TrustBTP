'use client'

/**
 * NotConnected — landing page + routage vers l'onboarding.
 *
 * FLOW LOGIQUE (de la promesse au service concret) :
 *   1. Hero                   (promesse)
 *   2. Direct Address         (je suis particulier / artisan, pain-points)
 *   3. Steps                  (comment ça fonctionne, 5 étapes Excalidraw) #comment-ca-fonctionne
 *   4. Budget Transparent     (décomposition 110 % + option fidélité au paiement)
 *   5. Arbitrage              (en cas de désaccord, 3 niveaux Excalidraw)
 *   6. Value Proposition      (ce que ça change concrètement)
 *   7. Artisan Network        (marketplace : trouver/rejoindre)
 *
 * Le bouton « Voir comment ça marche » scrolle vers la section Steps (#).
 * Les textes sont dans src/config/content.ts
 */

import { useState } from 'react'
import Link from 'next/link'
import {
  ShieldCheck, Layers, Zap, Scale, Hammer, FileText, Gift, Sparkles,
  User, Wrench, ArrowRight, AlertTriangle, Users, Gavel, Wallet,
  Check,
} from 'lucide-react'
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow'
import { CONTENT } from '@/config/content'

export default function NotConnected() {
  const [started, setStarted] = useState(false)

  if (started) {
    return <OnboardingFlow onKycComplete={() => window.location.reload()} />
  }

  const h = CONTENT.hero
  const da = CONTENT.directAddress
  const an = CONTENT.artisanNetwork
  const vp = CONTENT.valueProposition
  const bt = CONTENT.budgetTransparent
  const arb = CONTENT.arbitrage
  const trustIcons = [ShieldCheck, Layers, Zap, Scale]

  function scrollToSteps() {
    const el = document.getElementById('comment-ca-fonctionne')
    el?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="grid-bg min-h-[calc(100vh-65px)]">
      {/* ============================= 1. HERO ============================= */}
      <section className="relative py-24 px-4 text-center">
        <div className="absolute inset-0 flex items-start justify-center pointer-events-none">
          <div className="w-[600px] h-[300px] rounded-full bg-[oklch(0.82_0.15_175)]/10 blur-3xl" />
        </div>
        <div className="relative container max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-[oklch(0.82_0.15_175)]/30 bg-[oklch(0.82_0.15_175)]/10 px-4 py-1.5 text-sm text-[oklch(0.82_0.15_175)]">
            <ShieldCheck className="size-4" /> {h.badge}
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
            {h.title.line1}
            <br />
            {h.title.line2Prefix}{' '}
            <span className="text-[oklch(0.82_0.15_175)]">{h.title.line2Middle}</span>
            {h.title.line2Suffix && h.title.line2Suffix}
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
            <button
              onClick={scrollToSteps}
              className="rounded-full border border-[oklch(0.82_0.15_175)]/40 text-[oklch(0.82_0.15_175)] font-semibold px-8 py-3
                         hover:bg-[oklch(0.82_0.15_175)]/5 transition-colors text-lg"
            >
              {h.ctaSecondary} ↓
            </button>
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

      {/* ============================= 2. DIRECT ADDRESS ============================= */}
      <section className="py-16 px-4">
        <div className="container max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10">{da.title}</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-[oklch(0.82_0.15_175)]/20 bg-card p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[oklch(0.82_0.15_175)]/10">
                  <User className="size-5 text-[oklch(0.82_0.15_175)]" />
                </div>
                <h3 className="text-lg font-bold">{da.particulier.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{da.particulier.text}</p>
              <div className="rounded-lg bg-[oklch(0.82_0.15_175)]/10 border-l-2 border-[oklch(0.82_0.15_175)] p-3">
                <p className="text-sm font-semibold text-[oklch(0.82_0.15_175)]">
                  {da.particulier.highlight}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-purple-500/20 bg-card p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10">
                  <Wrench className="size-5 text-purple-400" />
                </div>
                <h3 className="text-lg font-bold">{da.artisan.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{da.artisan.text}</p>
              <div className="rounded-lg bg-purple-500/10 border-l-2 border-purple-400 p-3">
                <p className="text-sm font-semibold text-purple-400">
                  {da.artisan.highlight}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================= 3. STEPS (#comment-ca-fonctionne) ============================= */}
      <section id="comment-ca-fonctionne" className="py-16 px-4 scroll-mt-20">
        <div className="container max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            {CONTENT.steps.title}{' '}
            <span className="text-[oklch(0.82_0.15_175)]">{CONTENT.steps.titleHighlight}</span>
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-5 gap-6">
            {CONTENT.steps.list.map(({ num, title, desc }, i) => (
              <div key={num} className="relative text-center space-y-3">
                {i < CONTENT.steps.list.length - 1 && (
                  <div className="hidden md:block absolute top-5 left-1/2 w-full h-px bg-gradient-to-r from-[oklch(0.82_0.15_175)]/40 to-transparent" />
                )}
                <div className="text-5xl font-black text-[oklch(0.82_0.15_175)]/20 leading-none">
                  {num}
                </div>
                <h3 className="font-semibold text-sm">{title}</h3>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================= 4. BUDGET TRANSPARENT (110 %) ============================= */}
      <section className="py-16 px-4">
        <div className="container max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-[oklch(0.82_0.15_175)]/10 px-3 py-1 text-xs font-semibold text-[oklch(0.82_0.15_175)] mb-3">
              <ShieldCheck className="size-3" /> TRANSPARENCE TOTALE
            </div>
            <h2 className="text-3xl font-bold">{bt.title}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mt-3">{bt.subtitle}</p>
          </div>

          {/* Total 110% highlight */}
          <div className="text-center mb-8">
            <div className="inline-flex items-baseline gap-3 rounded-2xl border-2 border-[oklch(0.82_0.15_175)]/30 bg-card px-8 py-4">
              <span className="text-5xl font-black text-[oklch(0.82_0.15_175)]">{bt.total}</span>
              <span className="text-sm text-muted-foreground font-semibold">{bt.totalLabel}</span>
            </div>
          </div>

          {/* Breakdown 3 cards */}
          <div className="grid md:grid-cols-3 gap-4 mb-10">
            {bt.breakdown.map((item) => {
              const colorClass = {
                teal: {
                  border: 'border-[oklch(0.82_0.15_175)]/30',
                  bg: 'bg-[oklch(0.82_0.15_175)]/10',
                  text: 'text-[oklch(0.82_0.15_175)]',
                },
                purple: {
                  border: 'border-purple-500/30',
                  bg: 'bg-purple-500/10',
                  text: 'text-purple-400',
                },
                orange: {
                  border: 'border-orange-400/30',
                  bg: 'bg-orange-400/10',
                  text: 'text-orange-400',
                },
              }[item.color]
              return (
                <div
                  key={item.label}
                  className={`rounded-2xl border ${colorClass.border} ${colorClass.bg} p-6`}
                >
                  <div className={`text-4xl font-black mb-2 ${colorClass.text}`}>
                    {item.pct}
                  </div>
                  <h4 className="font-bold mb-2">{item.label}</h4>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              )
            })}
          </div>

          {/* Loyalty option — integrated INSIDE the budget section (pas un bonus) */}
          <div className="rounded-2xl border border-[oklch(0.82_0.15_175)]/20 bg-gradient-to-br from-[oklch(0.82_0.15_175)]/5 to-purple-500/5 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start gap-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[oklch(0.82_0.15_175)]/15 flex-shrink-0">
                <Gift className="size-6 text-[oklch(0.82_0.15_175)]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-bold">{bt.loyaltyOption.title}</h3>
                  <span className="text-xs font-semibold bg-[oklch(0.82_0.15_175)]/20 text-[oklch(0.82_0.15_175)] px-2 py-0.5 rounded-full">
                    OPTION
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  {bt.loyaltyOption.description}
                </p>
                <ul className="grid sm:grid-cols-2 gap-2 mb-4">
                  {bt.loyaltyOption.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm">
                      <Check className="size-4 text-[oklch(0.82_0.15_175)] mt-0.5 flex-shrink-0" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                {bt.loyaltyOption.note && (
                  <p className="text-xs text-muted-foreground italic border-t border-[oklch(0.82_0.15_175)]/10 pt-3">
                    ⓘ {bt.loyaltyOption.note}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================= 5. ARBITRAGE ============================= */}
      <section className="py-16 px-4">
        <div className="container max-w-5xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-3">
            <AlertTriangle className="size-5 text-orange-400" />
            <h2 className="text-3xl font-bold text-center">{arb.title}</h2>
          </div>
          <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-10">
            {arb.subtitle}
          </p>

          <div className="grid md:grid-cols-3 gap-4 relative">
            {arb.levels.map((lv, i) => {
              const isLast = i === arb.levels.length - 1
              const icons = [Users, ShieldCheck, Gavel]
              const Icon = icons[i] ?? Users
              return (
                <div key={lv.num} className="relative">
                  <div className="rounded-2xl border border-orange-400/30 bg-card p-5 h-full">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-400/10 font-bold text-orange-400">
                        {lv.num}
                      </div>
                      <div>
                        <div className="font-bold">{lv.name}</div>
                        <div className="text-xs text-orange-400">{lv.duration}</div>
                      </div>
                      <Icon className="size-5 ml-auto text-orange-400" />
                    </div>
                    <p className="text-sm text-muted-foreground">{lv.desc}</p>
                  </div>
                  {!isLast && (
                    <div className="hidden md:flex absolute top-1/2 -right-2 -translate-y-1/2 z-10">
                      <ArrowRight className="size-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {arb.note && (
            <p className="text-center text-xs text-muted-foreground italic mt-6 max-w-2xl mx-auto">
              ⓘ {arb.note}
            </p>
          )}
        </div>
      </section>

      {/* ============================= 6. VALUE PROPOSITION ============================= */}
      <section className="py-16 px-4">
        <div className="container max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10">{vp.title}</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-[oklch(0.82_0.15_175)]/20 bg-card p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[oklch(0.82_0.15_175)]/10">
                  <User className="size-5 text-[oklch(0.82_0.15_175)]" />
                </div>
                <h3 className="text-lg font-bold">{vp.particulier.title}</h3>
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

            <div className="rounded-2xl border border-purple-500/20 bg-card p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10">
                  <Wrench className="size-5 text-purple-400" />
                </div>
                <h3 className="text-lg font-bold">{vp.artisan.title}</h3>
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
          </div>
        </div>
      </section>

      {/* ============================= 7. ARTISAN NETWORK ============================= */}
      <section className="py-16 px-4 pb-24">
        <div className="container max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-3">{an.title}</h2>
          <p className="text-center text-muted-foreground max-w-2xl mx-auto mb-10">
            {an.subtitle}
          </p>

          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <Link
              href="/artisans"
              className="group rounded-2xl border-2 border-[oklch(0.82_0.15_175)]/30 bg-card p-6
                         hover:border-[oklch(0.82_0.15_175)] hover:-translate-y-1 transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[oklch(0.82_0.15_175)]/10">
                  <Hammer className="size-6 text-[oklch(0.82_0.15_175)]" />
                </div>
                <h3 className="font-bold text-lg">{an.particulier.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">{an.particulier.text}</p>
              <div className="flex items-center gap-2 text-sm font-semibold text-[oklch(0.82_0.15_175)]">
                {an.particulier.cta} <ArrowRight className="size-4" />
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
                <h3 className="font-bold text-lg">{an.artisan.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">{an.artisan.text}</p>
              <div className="flex items-center gap-2 text-sm font-semibold text-purple-400">
                {an.artisan.cta} <ArrowRight className="size-4" />
              </div>
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
            {an.highlights.map((h) => (
              <div key={h} className="flex items-center gap-1.5">
                <span className="text-[oklch(0.82_0.15_175)]">✓</span>
                <span>{h}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
