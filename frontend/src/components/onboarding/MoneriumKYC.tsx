'use client'

/**
 * MoneriumKYC — KYC adapté selon persona (Particulier ou Artisan pro).
 *
 * Mode PARTICULIER : email + téléphone + CNI + RIB (facultatif)
 * Mode ARTISAN     : idem + SIRET + Kbis + attestation décennale + RIB pro
 *
 * Textes : src/config/content.ts (kycMonerium)
 */

import { useState } from 'react'
import {
  FileText, Upload, Check, Shield, ArrowLeft, Wallet, Building2, User, Hammer,
} from 'lucide-react'
import { CONTENT } from '@/config/content'

type Persona = 'particulier' | 'artisan'

type Props = {
  persona: Persona
  onBack: () => void
  onComplete: () => void
  onSwitchToWallet?: () => void
}

export function MoneriumKYC({ persona, onBack, onComplete, onSwitchToWallet }: Props) {
  const c = CONTENT.kycMonerium
  const isArtisan = persona === 'artisan'

  // états communs
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [idUploaded, setIdUploaded] = useState(false)
  const [ribUploaded, setRibUploaded] = useState(false)

  // états artisan only
  const [siret, setSiret] = useState('')
  const [kbisUploaded, setKbisUploaded] = useState(false)
  const [decennalUploaded, setDecennalUploaded] = useState(false)

  const [submitting, setSubmitting] = useState(false)

  const baseOk = email.length > 3 && phone.length > 6 && idUploaded
  const artisanOk = siret.replace(/\s/g, '').length === 14 && kbisUploaded && decennalUploaded
  const canSubmit = isArtisan ? baseOk && artisanOk : baseOk

  async function handleSubmit() {
    setSubmitting(true)
    await new Promise((r) => setTimeout(r, 1500))
    onComplete()
  }

  const heading = isArtisan ? (c.titleArtisan ?? c.title) : (c.titleParticulier ?? c.title)
  const subheading = isArtisan ? (c.subtitleArtisan ?? c.subtitle) : c.subtitle

  const accent = isArtisan ? 'purple' : 'teal'
  const accentClasses = {
    teal: {
      border: 'border-[oklch(0.82_0.15_175)]',
      bg: 'bg-[oklch(0.82_0.15_175)]/5',
      text: 'text-[oklch(0.82_0.15_175)]',
      btn: 'bg-[oklch(0.82_0.15_175)] hover:bg-[oklch(0.75_0.15_175)]',
      check: 'bg-[oklch(0.82_0.15_175)]',
    },
    purple: {
      border: 'border-purple-500',
      bg: 'bg-purple-500/5',
      text: 'text-purple-400',
      btn: 'bg-purple-500 hover:bg-purple-600',
      check: 'bg-purple-500',
    },
  }[accent]

  return (
    <section className="grid-bg min-h-[calc(100vh-65px)] py-12 px-4">
      <div className="container max-w-5xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition mb-6"
        >
          <ArrowLeft className="size-4" /> {CONTENT.actions.back}
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${
            isArtisan ? 'bg-purple-500/10' : 'bg-[oklch(0.82_0.15_175)]/10'
          }`}>
            {isArtisan
              ? <Hammer className={`size-5 ${accentClasses.text}`} />
              : <User className={`size-5 ${accentClasses.text}`} />}
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              {heading}
            </h1>
          </div>
        </div>
        <p className="text-muted-foreground max-w-2xl mb-10">{subheading}</p>

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
                className={`mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5
                           focus:outline-none focus:${accentClasses.border} transition`}
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
                className={`mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5
                           focus:outline-none focus:${accentClasses.border} transition`}
              />
            </div>

            {/* CNI */}
            <UploadField
              label={c.fields.idLabel}
              help={c.fields.idHelp}
              uploadedText="CNI_recto_verso.pdf"
              uploadedHelp="214 Ko · vérifié"
              placeholder="Cliquer pour téléverser"
              uploaded={idUploaded}
              onUpload={() => setIdUploaded(true)}
              accent={accent}
            />

            {/* ===== CHAMPS ARTISAN PRO ===== */}
            {isArtisan && (
              <>
                <div className="pt-4 border-t border-border">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-400 mb-3">
                    <Building2 className="size-4" /> Informations entreprise
                  </div>

                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {c.artisanFields?.siretLabel}
                    </label>
                    <input
                      type="text"
                      placeholder={c.artisanFields?.siretPlaceholder}
                      value={siret}
                      onChange={(e) => setSiret(e.target.value.replace(/[^\d\s]/g, ''))}
                      className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5
                                 focus:outline-none focus:border-purple-500 transition"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {c.artisanFields?.siretHelp}
                    </p>
                  </div>
                </div>

                <UploadField
                  label={c.artisanFields?.kbisLabel ?? 'Extrait Kbis'}
                  help={c.artisanFields?.kbisHelp ?? ''}
                  uploadedText="Kbis_2026.pdf"
                  uploadedHelp="signé par le greffe · validé"
                  placeholder="Téléverser mon Kbis"
                  uploaded={kbisUploaded}
                  onUpload={() => setKbisUploaded(true)}
                  accent={accent}
                />

                <UploadField
                  label={c.artisanFields?.decennalLabel ?? 'Attestation décennale'}
                  help={c.artisanFields?.decennalHelp ?? ''}
                  uploadedText="Decennale_2026.pdf"
                  uploadedHelp="assureur Groupama · en cours de validité"
                  placeholder="Téléverser mon attestation décennale"
                  uploaded={decennalUploaded}
                  onUpload={() => setDecennalUploaded(true)}
                  accent={accent}
                />
              </>
            )}

            {/* RIB (commun, facultatif pour particulier, pro pour artisan) */}
            <UploadField
              label={isArtisan ? 'RIB professionnel' : c.fields.ribLabel}
              help={c.fields.ribHelp}
              uploadedText={isArtisan ? 'RIB_pro_BNP.pdf' : 'RIB_BNP.pdf'}
              uploadedHelp="FR76 **** **** 4821 · validé"
              placeholder={isArtisan ? 'Téléverser mon RIB pro' : 'Téléverser mon RIB (facultatif)'}
              uploaded={ribUploaded}
              onUpload={() => setRibUploaded(true)}
              accent={accent}
            />

            <button
              type="button"
              disabled={!canSubmit || submitting}
              onClick={handleSubmit}
              className={`w-full rounded-lg ${accentClasses.btn} text-black font-semibold py-3 transition-colors
                         disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              {submitting ? 'Vérification en cours…' : `${c.submit}${isArtisan ? ' (professionnel)' : ''}`}
            </button>

            <p className="text-xs text-muted-foreground text-center">{c.disclaimer}</p>

            {onSwitchToWallet && (
              <div className="pt-4 mt-4 border-t border-border">
                <button
                  type="button"
                  onClick={onSwitchToWallet}
                  className={`w-full flex items-center justify-center gap-2 text-xs text-muted-foreground
                              hover:${accentClasses.text} transition py-2`}
                >
                  <Wallet className="size-3.5" />
                  {c.switchToWallet}
                </button>
              </div>
            )}
          </div>

          {/* ============ SIDE INFO ============ */}
          <div className="rounded-2xl bg-[oklch(0.15_0.03_250)] text-white p-6 space-y-5">
            <div className={`flex items-center gap-2 font-bold ${accentClasses.text}`}>
              <Shield className="size-4" />
              <span className="text-xs uppercase tracking-wider">{c.sidePanel.title}</span>
            </div>

            <ul className="space-y-3">
              {c.sidePanel.items.map((it) => (
                <li key={it.title} className="flex items-start gap-3">
                  <span className={`${accentClasses.text} font-bold mt-0.5`}>●</span>
                  <div>
                    <div className="font-semibold text-sm">{it.title}</div>
                    <div className="text-xs text-white/60">{it.sub}</div>
                  </div>
                </li>
              ))}
            </ul>

            {isArtisan && (
              <div className="rounded-lg border-l-4 border-purple-400 bg-white/5 p-4 mt-4">
                <div className="font-bold text-purple-400 mb-1 text-sm">
                  🛠 Vérifications supplémentaires
                </div>
                <div className="text-xs text-white/80">
                  En tant qu’artisan professionnel, nous vérifions votre SIRET (INSEE), votre Kbis (greffe) et votre attestation décennale. C’est rapide et ça protège vos futurs clients.
                </div>
              </div>
            )}

            <div className={`rounded-lg border-l-4 ${accentClasses.border.replace('border-', 'border-l-')} bg-white/5 p-4 mt-6`}>
              <div className={`font-bold ${accentClasses.text} mb-1`}>
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

/* -------------------- helper : UploadField -------------------- */
function UploadField({
  label, help, uploadedText, uploadedHelp, placeholder,
  uploaded, onUpload, accent,
}: {
  label: string
  help: string
  uploadedText: string
  uploadedHelp: string
  placeholder: string
  uploaded: boolean
  onUpload: () => void
  accent: 'teal' | 'purple'
}) {
  const accentBorder =
    accent === 'purple' ? 'border-purple-500 bg-purple-500/5'
                        : 'border-[oklch(0.82_0.15_175)] bg-[oklch(0.82_0.15_175)]/5'
  const accentCheck =
    accent === 'purple' ? 'bg-purple-500'
                        : 'bg-[oklch(0.82_0.15_175)]'
  const accentIcon =
    accent === 'purple' ? 'text-purple-400'
                        : 'text-[oklch(0.82_0.15_175)]'

  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      {help && <p className="text-xs text-muted-foreground mt-1">{help}</p>}
      <button
        type="button"
        onClick={onUpload}
        className={`mt-2 w-full flex items-center gap-3 rounded-lg border-2 border-dashed px-4 py-3 transition
          ${uploaded ? accentBorder : 'border-border hover:border-muted-foreground hover:bg-muted/30'}`}
      >
        {uploaded
          ? <FileText className={`size-5 ${accentIcon}`} />
          : <Upload className="size-5 text-muted-foreground" />}
        <div className="text-left flex-1">
          <div className="text-sm font-semibold">
            {uploaded ? uploadedText : placeholder}
          </div>
          <div className="text-xs text-muted-foreground">
            {uploaded ? uploadedHelp : 'PDF ou image'}
          </div>
        </div>
        {uploaded && (
          <div className={`flex h-6 w-6 items-center justify-center rounded-full ${accentCheck}`}>
            <Check className="size-4 text-black" />
          </div>
        )}
      </button>
    </div>
  )
}
