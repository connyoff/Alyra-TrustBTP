'use client'

/**
 * MoneriumKYC — point d'entrée par défaut de l'onboarding.
 *
 * Intégration réelle à prévoir avec :
 *   - Monerium Partner SDK (https://monerium.dev/api-docs)
 *   - ou via Reown AppKit + Monerium OAuth
 *
 * Pour l'instant, ce composant simule le flow : email + phone + upload ID
 * puis redirige vers le dashboard.
 *
 * Power user : un lien discret "je préfère connecter mon wallet" permet
 * de basculer vers le flow wallet classique.
 *
 * Textes : src/config/content.ts
 */

import { useState } from 'react'
import { FileText, Upload, Check, Shield, ArrowLeft, Wallet } from 'lucide-react'
import { CONTENT } from '@/config/content'

type Props = {
  onBack: () => void
  onComplete: () => void
  onSwitchToWallet?: () => void
}

export function MoneriumKYC({ onBack, onComplete, onSwitchToWallet }: Props) {
  const c = CONTENT.kycMonerium

  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [idUploaded, setIdUploaded] = useState(false)
  const [ribUploaded, setRibUploaded] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const canSubmit = email.length > 3 && phone.length > 6 && idUploaded

  async function handleSubmit() {
    setSubmitting(true)
    // Simulated KYC verification (replace with real Monerium API call)
    await new Promise((r) => setTimeout(r, 1500))
    onComplete()
  }

  return (
    <section className="grid-bg min-h-[calc(100vh-65px)] py-12 px-4">
      <div className="container max-w-5xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition mb-6"
        >
          <ArrowLeft className="size-4" /> {CONTENT.actions.back}
        </button>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
          {c.title}
        </h1>
        <p className="text-muted-foreground max-w-2xl mb-10">{c.subtitle}</p>

        <div className="grid md:grid-cols-[1.1fr_0.9fr] gap-6">
          {/* ============ FORM CARD ============ */}
          <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {c.fields.emailLabel}
              </label>
              <input
                type="email"
                placeholder={c.fields.emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5
                           focus:outline-none focus:border-[oklch(0.82_0.15_175)] transition"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {c.fields.phoneLabel}
              </label>
              <input
                type="tel"
                placeholder={c.fields.phonePlaceholder}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5
                           focus:outline-none focus:border-[oklch(0.82_0.15_175)] transition"
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {c.fields.idLabel}
              </label>
              <p className="text-xs text-muted-foreground mt-1">{c.fields.idHelp}</p>
              <button
                type="button"
                onClick={() => setIdUploaded(true)}
                className={`mt-2 w-full flex items-center gap-3 rounded-lg border-2 border-dashed px-4 py-3 transition
                  ${idUploaded
                    ? 'border-[oklch(0.82_0.15_175)] bg-[oklch(0.82_0.15_175)]/5'
                    : 'border-border hover:border-[oklch(0.82_0.15_175)]/50 hover:bg-muted/30'}`}
              >
                {idUploaded ? (
                  <FileText className="size-5 text-[oklch(0.82_0.15_175)]" />
                ) : (
                  <Upload className="size-5 text-muted-foreground" />
                )}
                <div className="text-left flex-1">
                  <div className="text-sm font-semibold">
                    {idUploaded ? 'CNI_recto_verso.pdf' : 'Cliquer pour téléverser'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {idUploaded ? '214 Ko · vérifié' : 'PDF ou image'}
                  </div>
                </div>
                {idUploaded && (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[oklch(0.82_0.15_175)]">
                    <Check className="size-4 text-black" />
                  </div>
                )}
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {c.fields.ribLabel}
              </label>
              <p className="text-xs text-muted-foreground mt-1">{c.fields.ribHelp}</p>
              <button
                type="button"
                onClick={() => setRibUploaded(true)}
                className={`mt-2 w-full flex items-center gap-3 rounded-lg border-2 border-dashed px-4 py-3 transition
                  ${ribUploaded
                    ? 'border-[oklch(0.82_0.15_175)] bg-[oklch(0.82_0.15_175)]/5'
                    : 'border-border hover:border-[oklch(0.82_0.15_175)]/50 hover:bg-muted/30'}`}
              >
                {ribUploaded ? (
                  <FileText className="size-5 text-[oklch(0.82_0.15_175)]" />
                ) : (
                  <Upload className="size-5 text-muted-foreground" />
                )}
                <div className="text-left flex-1">
                  <div className="text-sm font-semibold">
                    {ribUploaded ? 'RIB_BNP.pdf' : 'Téléverser mon RIB (facultatif)'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {ribUploaded ? 'FR76 **** **** 4821 · validé' : 'FR76 · IBAN'}
                  </div>
                </div>
                {ribUploaded && (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[oklch(0.82_0.15_175)]">
                    <Check className="size-4 text-black" />
                  </div>
                )}
              </button>
            </div>

            <button
              type="button"
              disabled={!canSubmit || submitting}
              onClick={handleSubmit}
              className="w-full rounded-lg bg-[oklch(0.82_0.15_175)] text-black font-semibold py-3
                         hover:bg-[oklch(0.75_0.15_175)] transition-colors
                         disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? 'Vérification en cours…' : c.submit}
            </button>

            <p className="text-xs text-muted-foreground text-center">{c.disclaimer}</p>

            {/* ----- Lien power user : basculer vers wallet ----- */}
            {onSwitchToWallet && (
              <div className="pt-4 mt-4 border-t border-border">
                <button
                  type="button"
                  onClick={onSwitchToWallet}
                  className="w-full flex items-center justify-center gap-2 text-xs text-muted-foreground
                             hover:text-[oklch(0.82_0.15_175)] transition py-2"
                >
                  <Wallet className="size-3.5" />
                  {c.switchToWallet}
                </button>
              </div>
            )}
          </div>

          {/* ============ SIDE INFO ============ */}
          <div className="rounded-2xl bg-[oklch(0.15_0.03_250)] text-white p-6 space-y-5">
            <div className="flex items-center gap-2 text-[oklch(0.82_0.15_175)] font-bold">
              <Shield className="size-4" />
              <span className="text-xs uppercase tracking-wider">{c.sidePanel.title}</span>
            </div>

            <ul className="space-y-3">
              {c.sidePanel.items.map((it) => (
                <li key={it.title} className="flex items-start gap-3">
                  <span className="text-[oklch(0.82_0.15_175)] font-bold mt-0.5">●</span>
                  <div>
                    <div className="font-semibold text-sm">{it.title}</div>
                    <div className="text-xs text-white/60">{it.sub}</div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="rounded-lg border-l-4 border-[oklch(0.82_0.15_175)] bg-white/5 p-4 mt-6">
              <div className="font-bold text-[oklch(0.82_0.15_175)] mb-1">
                {c.sidePanel.callout.title}
              </div>
              <div className="text-sm text-white/80">{c.sidePanel.callout.body}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
