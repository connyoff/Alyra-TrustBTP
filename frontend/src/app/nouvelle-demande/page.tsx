'use client'

/**
 * /nouvelle-demande — le particulier poste une annonce de demande de travaux.
 *
 * Pour le MVP, c'est un formulaire local qui simule la soumission.
 * En prod : envoyer à un backend (Supabase / API route) + notification
 * aux artisans correspondant aux critères (zone + spécialités).
 */

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { SPECIALTY_LABELS, type Specialty } from '@/config/artisans'

const ALL_SPECIALTIES = Object.keys(SPECIALTY_LABELS) as Specialty[]

export default function NouvelleDemandePage() {
  const [submitted, setSubmitted] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [city, setCity] = useState('')
  const [budget, setBudget] = useState('')
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [deadline, setDeadline] = useState('')

  const canSubmit =
    title.length > 5 &&
    description.length > 20 &&
    postalCode.length === 5 &&
    city.length > 2 &&
    specialties.length > 0

  function toggleSpec(s: Specialty) {
    setSpecialties((cur) =>
      cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s],
    )
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // Simule l'envoi au backend
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="grid-bg min-h-[calc(100vh-65px)] flex items-center justify-center px-4">
        <div className="max-w-md text-center space-y-5">
          <div className="flex h-20 w-20 rounded-full bg-[oklch(0.82_0.15_175)]/10 mx-auto items-center justify-center">
            <CheckCircle2 className="size-10 text-[oklch(0.82_0.15_175)]" />
          </div>
          <h1 className="text-3xl font-extrabold">Votre demande est publiée !</h1>
          <p className="text-muted-foreground">
            Les artisans correspondant à <strong className="text-foreground">
            {specialties.map((s) => SPECIALTY_LABELS[s]).join(', ')}
            </strong> dans la zone <strong className="text-foreground">{postalCode}</strong> vont
            recevoir une notification. Vous serez averti dès qu&apos;un artisan répond.
          </p>
          <div className="rounded-xl border border-[oklch(0.82_0.15_175)]/20 bg-[oklch(0.82_0.15_175)]/5 p-4 text-sm">
            <strong className="text-[oklch(0.82_0.15_175)]">Prochaine étape :</strong> une fois que
            vous trouvez l&apos;artisan qui vous convient et que vous convenez d&apos;un devis, vous
            basculez sur la plateforme Trust BTP pour sécuriser le paiement via escrow on-chain.
          </div>
          <div className="flex gap-3 justify-center pt-2">
            <Link
              href="/artisans"
              className="rounded-lg border border-border px-4 py-2 text-sm font-semibold hover:border-foreground transition"
            >
              Parcourir les artisans
            </Link>
            <Link
              href="/"
              className="rounded-lg bg-[oklch(0.82_0.15_175)] text-black px-4 py-2 text-sm font-semibold hover:bg-[oklch(0.75_0.15_175)] transition"
            >
              Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid-bg min-h-screen">
      <div className="container max-w-3xl mx-auto px-4 py-10">
        <Link
          href="/artisans"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition mb-6"
        >
          <ArrowLeft className="size-4" /> Retour aux artisans
        </Link>

        <h1 className="text-3xl font-extrabold mb-2">Poster une demande de travaux</h1>
        <p className="text-muted-foreground mb-8">
          Décris ton projet. Les artisans référencés dans ta zone et sur tes besoins
          te contacteront directement — pas d&apos;intermédiaire.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-border bg-card p-6">
          {/* Title */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Titre de la demande
            </label>
            <input
              type="text"
              placeholder="Ex: Rénovation salle de bain 6 m²"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5
                         focus:outline-none focus:border-[oklch(0.82_0.15_175)] transition"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Description détaillée
            </label>
            <textarea
              rows={5}
              placeholder="Décris le projet : surface, état actuel, matériaux souhaités, contraintes…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5
                         focus:outline-none focus:border-[oklch(0.82_0.15_175)] transition resize-none"
            />
          </div>

          {/* Specialties */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Compétences recherchées
            </label>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {ALL_SPECIALTIES.map((s) => {
                const active = specialties.includes(s)
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSpec(s)}
                    className={`text-sm px-3 py-1.5 rounded-full transition
                      ${active
                        ? 'bg-[oklch(0.82_0.15_175)] text-black font-semibold'
                        : 'bg-muted text-muted-foreground hover:bg-muted/70'}`}
                  >
                    {SPECIALTY_LABELS[s]}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Location */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Code postal
              </label>
              <input
                type="text"
                placeholder="75011"
                maxLength={5}
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, ''))}
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5
                           focus:outline-none focus:border-[oklch(0.82_0.15_175)] transition"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Ville
              </label>
              <input
                type="text"
                placeholder="Paris 11"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5
                           focus:outline-none focus:border-[oklch(0.82_0.15_175)] transition"
              />
            </div>
          </div>

          {/* Budget + deadline */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Budget estimé (facultatif)
              </label>
              <input
                type="text"
                placeholder="Ex: 5 000 - 10 000 €"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5
                           focus:outline-none focus:border-[oklch(0.82_0.15_175)] transition"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Démarrage souhaité (facultatif)
              </label>
              <input
                type="text"
                placeholder="Ex: dans 2 à 4 semaines"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2.5
                           focus:outline-none focus:border-[oklch(0.82_0.15_175)] transition"
              />
            </div>
          </div>

          {/* Disclaimer */}
          <div className="rounded-lg border border-[oklch(0.82_0.15_175)]/20 bg-[oklch(0.82_0.15_175)]/5 p-3 text-xs text-muted-foreground">
            <strong className="text-[oklch(0.82_0.15_175)]">ⓘ Mise en relation uniquement.</strong>{' '}
            Trust BTP diffuse votre demande aux artisans. La négociation du devis se fait directement entre vous.
            Le paiement n&apos;est jamais engagé à cette étape.
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full rounded-lg bg-[oklch(0.82_0.15_175)] text-black font-semibold py-3
                       hover:bg-[oklch(0.75_0.15_175)] transition
                       disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Publier ma demande
          </button>
        </form>
      </div>
    </div>
  )
}
