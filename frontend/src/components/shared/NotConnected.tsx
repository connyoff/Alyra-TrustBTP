'use client'

/**
 * NotConnected — landing page + routage vers l'onboarding.
 *
 * - Bouton "Commencer" → OnboardingFlow (choix Monerium / Wallet → KYC éventuel)
 * - Les textes sont dans src/config/content.ts (édite-les là)
 */

import { useState } from 'react'
import { ShieldCheck, Layers, Zap, Scale } from 'lucide-react'
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow'
import { CONTENT } from '@/config/content'

export default function NotConnected() {
  const [started, setStarted] = useState(false)

  if (started) {
    // The user clicked "Commencer" — show onboarding flow.
    // On KYC complete, we reload the page; the dashboard will take over
    // (via the isConnected check in page.tsx).
    return <OnboardingFlow onKycComplete={() => window.location.reload()} />
  }

  const c = CONTENT.hero
  const iconMap = { ShieldCheck, Layers, Zap, Scale }
  const trustIcons = [ShieldCheck, Layers, Zap, Scale]

  return (
    <div className="grid-bg min-h-[calc(100vh-65px)]">
      {/* Hero */}
      <section className="relative py-24 px-4 text-center">
        <div className="absolute inset-0 flex items-start justify-center pointer-events-none">
          <div className="w-[600px] h-[300px] rounded-full bg-[oklch(0.82_0.15_175)]/10 blur-3xl" />
        </div>
        <div className="relative container max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-[oklch(0.82_0.15_175)]/30 bg-[oklch(0.82_0.15_175)]/10 px-4 py-1.5 text-sm text-[oklch(0.82_0.15_175)]">
            <ShieldCheck className="size-4" /> {c.badge}
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-tight">
            {c.title.line1}<br />
            {c.title.line2Prefix}<span className="text-teal">{c.title.line2Middle}</span>{' '}
            <span className="text-[oklch(0.82_0.15_175)]">{c.title.line2Suffix}</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            {c.subtitle}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => setStarted(true)}
              className="rounded-full bg-[oklch(0.82_0.15_175)] text-black font-semibold px-8 py-3
                         hover:bg-[oklch(0.75_0.15_175)] transition-colors text-lg"
            >
              {c.ctaPrimary} →
            </button>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-sm text-muted-foreground">
            {c.trustItems.map((label, i) => {
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

      {/* Comment ça marche */}
      <section className="py-20 px-4">
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

      {/* Deux publics */}
      <section className="py-16 px-4 pb-24">
        <div className="container max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10">
            {CONTENT.audiences.title}{' '}
            <span className="text-[oklch(0.82_0.15_175)]">
              {CONTENT.audiences.titleHighlight}
            </span>
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {/* Particuliers */}
            <div className="rounded-2xl border border-[oklch(0.82_0.15_175)]/20 bg-card p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[oklch(0.82_0.15_175)]/10">
                  <ShieldCheck className="size-5 text-[oklch(0.82_0.15_175)]" />
                </div>
                <h3 className="text-lg font-bold">{CONTENT.audiences.particuliers.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{CONTENT.audiences.particuliers.lead}</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {CONTENT.audiences.particuliers.items.map(item => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="text-[oklch(0.82_0.15_175)] mt-0.5 flex-shrink-0">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            {/* Artisans */}
            <div className="rounded-2xl border border-purple-500/20 bg-card p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10">
                  <Zap className="size-5 text-purple-400" />
                </div>
                <h3 className="text-lg font-bold">{CONTENT.audiences.artisans.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground">{CONTENT.audiences.artisans.lead}</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {CONTENT.audiences.artisans.items.map(item => (
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
    </div>
  )
}
