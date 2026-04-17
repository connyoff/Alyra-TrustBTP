'use client'

/**
 * ChooseLogin — écran de choix entre :
 *   - Monerium (Web2-like KYC, recommandé grand public)
 *   - Wallet (Rabby, MetaMask… via Reown AppKit)
 *
 * Les textes sont centralisés dans src/config/content.ts — édite-les là.
 */

import { AppKitButton } from '@reown/appkit/react'
import { Mail, Wallet, Check, Shield, Zap } from 'lucide-react'
import { CONTENT } from '@/config/content'

type Props = {
  onChooseMonerium: () => void
}

export function ChooseLogin({ onChooseMonerium }: Props) {
  const c = CONTENT.chooseLogin

  return (
    <section className="grid-bg min-h-[calc(100vh-65px)] py-16 px-4">
      <div className="container max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-3">
            {c.title}
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {c.subtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* ============ MONERIUM CARD ============ */}
          <div
            role="button"
            tabIndex={0}
            onClick={onChooseMonerium}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onChooseMonerium()}
            className="group relative rounded-2xl border-2 border-[oklch(0.82_0.15_175)]/30 bg-card p-8
                       hover:border-[oklch(0.82_0.15_175)]/70 hover:-translate-y-1 transition-all cursor-pointer
                       focus:outline-none focus:ring-2 focus:ring-[oklch(0.82_0.15_175)]/50"
          >
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[oklch(0.82_0.15_175)]/10 px-3 py-1 text-xs font-semibold text-[oklch(0.82_0.15_175)]">
              <Shield className="size-3" />
              {c.monerium.badge}
            </div>

            <div className="mt-6 flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[oklch(0.82_0.15_175)]/10 flex-shrink-0">
                <Mail className="size-7 text-[oklch(0.82_0.15_175)]" />
              </div>
              <div>
                <h3 className="text-xl font-bold">{c.monerium.title}</h3>
                <p className="text-sm text-muted-foreground">{c.monerium.subtitle}</p>
              </div>
            </div>

            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
              {c.monerium.description}
            </p>

            <ul className="mt-5 space-y-2">
              {c.monerium.bullets.map((b) => (
                <li key={b} className="flex items-start gap-2 text-sm">
                  <Check className="size-4 text-[oklch(0.82_0.15_175)] mt-0.5 flex-shrink-0" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>

            <button
              type="button"
              className="mt-6 w-full rounded-lg bg-[oklch(0.82_0.15_175)] text-black font-semibold py-3
                         hover:bg-[oklch(0.75_0.15_175)] transition-colors"
            >
              {c.monerium.cta} →
            </button>
          </div>

          {/* ============ WALLET CARD ============ */}
          <div className="group relative rounded-2xl border-2 border-purple-500/30 bg-card p-8
                          hover:border-purple-500/70 hover:-translate-y-1 transition-all">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-400">
              <Zap className="size-3" />
              {c.wallet.badge}
            </div>

            <div className="mt-6 flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-purple-500/10 flex-shrink-0">
                <Wallet className="size-7 text-purple-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold">{c.wallet.title}</h3>
                <p className="text-sm text-muted-foreground">{c.wallet.subtitle}</p>
              </div>
            </div>

            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
              {c.wallet.description}
            </p>

            <ul className="mt-5 space-y-2">
              {c.wallet.bullets.map((b) => (
                <li key={b} className="flex items-start gap-2 text-sm">
                  <Check className="size-4 text-purple-400 mt-0.5 flex-shrink-0" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex">
              <AppKitButton />
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-10">
          Changer de mode plus tard est possible à tout moment dans les paramètres du compte.
        </p>
      </div>
    </section>
  )
}
