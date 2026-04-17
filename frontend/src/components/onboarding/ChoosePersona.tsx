'use client'

/**
 * ChoosePersona — écran de choix entre Particulier et Artisan.
 * Conditionne le KYC suivant (fields différents pour l'artisan pro).
 * Textes : src/config/content.ts (choosePersona)
 */

import { User, Hammer, ArrowLeft, ArrowRight, ShieldCheck, Check } from 'lucide-react'
import { CONTENT } from '@/config/content'

type Props = {
  onChoose: (persona: 'particulier' | 'artisan') => void
  onCancel: () => void
}

export function ChoosePersona({ onChoose, onCancel }: Props) {
  const c = CONTENT.choosePersona

  return (
    <section className="grid-bg min-h-[calc(100vh-65px)] py-16 px-4">
      <div className="container max-w-5xl mx-auto">
        <button
          onClick={onCancel}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition mb-8"
        >
          <ArrowLeft className="size-4" /> {CONTENT.actions.back}
        </button>

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-center mb-3">
          {c.title}
        </h1>
        <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
          {c.subtitle}
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {/* =========== PARTICULIER =========== */}
          <button
            onClick={() => onChoose('particulier')}
            className="group rounded-2xl border-2 border-[oklch(0.82_0.15_175)]/30 bg-card p-8
                       hover:border-[oklch(0.82_0.15_175)] hover:-translate-y-1 transition-all text-left"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[oklch(0.82_0.15_175)]/10 group-hover:scale-110 transition">
                <User className="size-7 text-[oklch(0.82_0.15_175)]" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">{c.particulier.title}</h3>
                <p className="text-sm text-muted-foreground">{c.particulier.subtitle}</p>
              </div>
            </div>

            <ul className="space-y-2.5 mb-6">
              {c.particulier.bullets.map((b) => (
                <li key={b} className="flex items-start gap-2 text-sm">
                  <Check className="size-4 text-[oklch(0.82_0.15_175)] mt-0.5 flex-shrink-0" />
                  <span className="text-foreground/90">{b}</span>
                </li>
              ))}
            </ul>

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <span className="text-sm font-semibold text-[oklch(0.82_0.15_175)]">
                {c.particulier.cta}
              </span>
              <ArrowRight className="size-4 text-[oklch(0.82_0.15_175)] group-hover:translate-x-1 transition" />
            </div>
          </button>

          {/* =========== ARTISAN =========== */}
          <button
            onClick={() => onChoose('artisan')}
            className="group rounded-2xl border-2 border-purple-500/30 bg-card p-8
                       hover:border-purple-500 hover:-translate-y-1 transition-all text-left"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-purple-500/10 group-hover:scale-110 transition">
                <Hammer className="size-7 text-purple-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">{c.artisan.title}</h3>
                <p className="text-sm text-muted-foreground">{c.artisan.subtitle}</p>
              </div>
            </div>

            <ul className="space-y-2.5 mb-6">
              {c.artisan.bullets.map((b) => (
                <li key={b} className="flex items-start gap-2 text-sm">
                  <Check className="size-4 text-purple-400 mt-0.5 flex-shrink-0" />
                  <span className="text-foreground/90">{b}</span>
                </li>
              ))}
            </ul>

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <span className="text-sm font-semibold text-purple-400">
                {c.artisan.cta}
              </span>
              <ArrowRight className="size-4 text-purple-400 group-hover:translate-x-1 transition" />
            </div>
          </button>
        </div>

        <div className="mt-10 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="size-4 text-[oklch(0.82_0.15_175)]" />
          <span>
            Vous pourrez toujours ajuster votre profil plus tard depuis les paramètres de votre compte.
          </span>
        </div>
      </div>
    </section>
  )
}
