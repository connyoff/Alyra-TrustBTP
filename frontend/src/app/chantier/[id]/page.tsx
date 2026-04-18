'use client'

import { use, useState } from 'react'
import { useAccount } from 'wagmi'
import {
  Loader2, CheckCircle2, AlertTriangle, ShieldOff, ShieldCheck, RotateCcw,
  XCircle, Zap, Clock, Info, Calendar
} from 'lucide-react'
import { useChantier } from '@/hooks/useChantier'
import { useJalonActions } from '@/hooks/useJalonActions'
import { useAcceptDevis } from '@/hooks/useAcceptDevis'
import { TrustScoreBadge } from '@/components/chantier/TrustScoreBadge'
import { ChantierStatusBadge, JalonStatusLabel } from '@/components/chantier/StatusBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ChantierStatus, JalonStatus } from '@/types/contracts'
import { formatToken, formatDeadline, shortAddress, hashProof, timeUntilAutoValidation } from '@/lib/utils'

interface Props {
  params: Promise<{ id: string }>
}

export default function ChantierDetailPage({ params }: Props) {
  const { id } = use(params)
  const chantierId = BigInt(id)
  const { address } = useAccount()
const { chantier, jalons, isLoading, refetch } = useChantier(chantierId)
  const jalonActions = useJalonActions(refetch)

  // Formulaire proof hash
  const [proofInput, setProofInput] = useState('')
  const [clientProofInput, setClientProofInput] = useState('')
  // Yield opt-in pour l'acceptation du devis
  const [yieldOptIn, setYieldOptIn] = useState(false)
  // Litige resolve form (arbitre)
  const [artisanEnTort, setArtisanEnTort] = useState(true)
  const [blockedBps, setBlockedBps] = useState('500')
  const [penaltyBps, setPenaltyBps] = useState('200')
  // Flow de refus particulier (panneau dépliable)
  const [refuseOpen, setRefuseOpen] = useState(false)

  const depositAmount = chantier ? (chantier.devisAmount * 11n) / 10n : 0n
  const acceptDevis = useAcceptDevis(chantierId, depositAmount, address, refetch)

  if (isLoading || !chantier) {
    return (
      <div className="container max-w-3xl mx-auto px-4 py-16 flex items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
        Chargement du chantier...
      </div>
    )
  }

  const role =
    address?.toLowerCase() === chantier.artisan.toLowerCase()
      ? 'artisan'
      : address?.toLowerCase() === chantier.particulier.toLowerCase()
      ? 'particulier'
      : 'viewer'

  // Vérifier si l'adresse est l'arbitre (lecture directe du contrat non implémentée ici —
  // l'arbitre verra les boutons si son adresse ne matche aucune partie)
  const currentJalon = jalons[chantier.currentJalonIndex]
  const autoVal = currentJalon?.status === JalonStatus.Finished
    ? timeUntilAutoValidation(currentJalon.finishedAt)
    : null

  async function handleValidateJalon() {
    const input = proofInput.trim()
    const proof = input.startsWith('0x') && input.length === 66
      ? (input as `0x${string}`)
      : await hashProof(input || `proof-${chantierId}-${chantier!.currentJalonIndex}-${Date.now()}`)
    jalonActions.validateJalon(chantierId, proof)
    setProofInput('')
  }

  async function handleMinorReserves() {
    const input = clientProofInput.trim()
    const proof = input.startsWith('0x') && input.length === 66
      ? (input as `0x${string}`)
      : await hashProof(input || `client-proof-${Date.now()}`)
    jalonActions.acceptJalonWithMinorReserves(chantierId, proof)
    setClientProofInput('')
  }

  async function handleMajorReserves() {
    const input = clientProofInput.trim()
    const proof = input.startsWith('0x') && input.length === 66
      ? (input as `0x${string}`)
      : await hashProof(input || `client-proof-major-${Date.now()}`)
    jalonActions.acceptJalonWithMajorReserves(chantierId, proof)
    setClientProofInput('')
  }

  const isPending = jalonActions.isPending || acceptDevis.isPending

  return (
    <div className="container max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* En-tête chantier */}
      <div className="rounded-xl border border-border/50 bg-card p-6 space-y-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              {(() => {
                const full = chantier.name || jalons[0]?.description || `Chantier #${id}`
                const display = full.length > 20 ? full.slice(0, 20) + '…' : full
                return <h1 className="text-xl font-bold" title={full}>{display}</h1>
              })()}
              <ChantierStatusBadge status={chantier.status} />
            </div>
            <p className="text-xs text-muted-foreground">
              ID #{id}{chantier.name && jalons[0]?.description ? ` · ${jalons[0].description}` : ''}
            </p>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${
              chantier.status === ChantierStatus.Completed
                ? 'text-[oklch(0.82_0.15_175)]'
                : chantier.status === ChantierStatus.Active
                  ? 'text-sky-300'
                  : 'text-muted-foreground'
            }`}>
              {formatToken(chantier.devisAmount)}
            </div>
            <div className="text-xs text-muted-foreground">
              Dépôt : {formatToken(chantier.depositAmount)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-xs text-muted-foreground">Artisan</div>
            <div className="font-mono">{shortAddress(chantier.artisan)}</div>
            {role === 'artisan' && (
              <TrustScoreBadge artisanAddress={chantier.artisan} compact />
            )}
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Particulier</div>
            <div className="font-mono">{shortAddress(chantier.particulier)}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Avantage fidélité</div>
            <div>{chantier.yieldOptIn ? '✅ Activé' : '—'}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Jalon en cours</div>
            <div>{chantier.currentJalonIndex + 1} / {chantier.jalonCount}</div>
          </div>
        </div>
      </div>

      {/* Carte NFT chantier — visible par les 2 parties */}
      {chantier.status !== ChantierStatus.DevisSubmitted && (role === 'artisan' || role === 'particulier') && (
        <div className="rounded-xl border border-[oklch(0.82_0.15_175)]/30 bg-gradient-to-br from-[oklch(0.82_0.15_175)]/5 to-purple-500/5 p-6 space-y-3">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-5 text-[oklch(0.82_0.15_175)]" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-[oklch(0.82_0.15_175)]">
                  NFT Chantier Soulbound
                </h2>
              </div>
              <p className="text-sm text-foreground/90">
                Ce NFT est dans votre wallet <strong>{role === 'artisan' ? 'artisan' : 'particulier'}</strong>.
                Il est la preuve immuable et horodatée de votre contrat.
              </p>
              <p className="text-xs text-muted-foreground">
                Ni vous ni l'autre partie ne pouvez le transférer — il reste lié à votre adresse à vie.
                Les jalons validés y sont enregistrés automatiquement.
              </p>
            </div>
            <div className="flex flex-col items-end gap-1 text-right">
              <div className="text-xs text-muted-foreground">Votre tokenId</div>
              <div className="font-mono text-sm text-foreground">
                #{role === 'artisan'
                  ? `2^128 + ${chantierId.toString()}`
                  : chantierId.toString()}
              </div>
              <a
                href={`https://sepolia.arbiscan.io/token/0x14a3579cEB5E0E01581Bb2d86e658e92151003fe?a=${role === 'artisan' ? chantier.artisan : chantier.particulier}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[oklch(0.82_0.15_175)] hover:underline inline-flex items-center gap-1 mt-1"
              >
                Voir sur Arbiscan ↗
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Timeline des jalons */}
      <div className="rounded-xl border border-border/50 bg-card p-6 space-y-1">
        <h2 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Jalons</h2>
        {jalons.map((jalon, idx) => {
          const isCurrent = idx === chantier.currentJalonIndex
          const isDone = jalon.status === JalonStatus.Accepted || jalon.status === JalonStatus.ReservesLifted

          return (
            <div
              key={idx}
              className={`rounded-lg px-4 py-3 border transition-colors ${
                isCurrent && chantier.status === ChantierStatus.Active
                  ? 'border-[oklch(0.82_0.15_175)]/30 bg-[oklch(0.82_0.15_175)]/5'
                  : 'border-transparent'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold flex-shrink-0 ${
                    isDone ? 'bg-emerald-500/20 text-emerald-400' : isCurrent ? 'bg-[oklch(0.82_0.15_175)]/20 text-[oklch(0.82_0.15_175)]' : 'bg-white/5 text-muted-foreground'
                  }`}>
                    {idx + 1}
                  </span>
                  <div>
                    <div className="text-sm font-medium">{jalon.description}</div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-xs text-muted-foreground">{formatToken(jalon.amount)}</span>
                      {jalon.deadline > 0n && (
                        <span className={`inline-flex items-center gap-1 text-xs ${
                          jalon.deadline < BigInt(Math.floor(Date.now() / 1000)) &&
                          jalon.status !== JalonStatus.Accepted &&
                          jalon.status !== JalonStatus.ReservesLifted
                            ? 'text-amber-400'
                            : 'text-muted-foreground/60'
                        }`}>
                          <Calendar className="size-3" />
                          {formatDeadline(jalon.deadline)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <JalonStatusLabel status={jalon.status} />
                  {jalon.status === JalonStatus.Finished && autoVal && isCurrent && (
                    <span className={`text-xs ${autoVal.expired ? 'text-emerald-400' : 'text-blue-400'}`}>
                      {autoVal.label}
                    </span>
                  )}
                  {jalon.blockedAmount > 0n && (
                    <span className="text-xs text-amber-400">
                      {formatToken(jalon.blockedAmount)} bloqué
                    </span>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Zone d'actions — dépend du rôle et statut */}
      <div className="space-y-4">

        {/* ── PARTICULIER : accepter/refuser le devis ── */}
        {role === 'particulier' && chantier.status === ChantierStatus.DevisSubmitted && (
          <ActionCard title="Devis en attente de signature" icon={<Info className="size-5 text-blue-400" />}>
            <p className="text-sm text-muted-foreground mb-4">
              L'artisan a soumis ce devis. Signez l'autorisation (sans gas), puis déposez{' '}
              <strong>{formatToken(depositAmount)}</strong> (110% du montant) en une seule transaction.
            </p>
            <div className="flex items-center gap-2 mb-5">
              <input
                id="yieldOptIn"
                type="checkbox"
                className="rounded"
                checked={yieldOptIn}
                onChange={e => setYieldOptIn(e.target.checked)}
              />
              <label htmlFor="yieldOptIn" className="text-sm cursor-pointer">
                Activer l'avantage fidélité — les fonds non utilisés peuvent ouvrir droit à des avantages liés au chantier entre deux jalons. Ces avantages ne constituent pas un produit financier.
              </label>
            </div>

            {/* Étapes visuelles */}
            <div className="flex items-center gap-2 mb-4 text-xs text-muted-foreground">
              <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${acceptDevis.isSigned ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10'}`}>
                {acceptDevis.isSigned ? '✓' : '1'}
              </span>
              <span className={acceptDevis.isSigned ? 'text-emerald-400' : ''}>
                Signer le permit (off-chain, sans gas)
              </span>
              <span className="mx-1">→</span>
              <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${acceptDevis.step === 'done' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10'}`}>
                2
              </span>
              <span>Déposer et activer le chantier</span>
            </div>

            <div className="flex gap-2 flex-wrap">
              {!acceptDevis.isSigned && !acceptDevis.hasEnoughAllowance && (
                <Button
                  onClick={acceptDevis.sign}
                  disabled={isPending || acceptDevis.step === 'signing'}
                  className="bg-[oklch(0.82_0.15_175)] text-black hover:bg-[oklch(0.75_0.15_175)] gap-2"
                >
                  {acceptDevis.step === 'signing' && <Loader2 className="size-4 animate-spin" />}
                  <Zap className="size-4" />
                  1. Signer le permit
                </Button>
              )}
              {(acceptDevis.isSigned || acceptDevis.hasEnoughAllowance) && (
                <Button
                  onClick={() => acceptDevis.accept(yieldOptIn)}
                  disabled={isPending}
                  className="bg-[oklch(0.82_0.15_175)] text-black hover:bg-[oklch(0.75_0.15_175)] gap-2"
                >
                  {isPending && <Loader2 className="size-4 animate-spin" />}
                  2. Déposer {formatToken(depositAmount)}
                </Button>
              )}
              <Button
                variant="destructive"
                onClick={() => jalonActions.rejectDevis(chantierId)}
                disabled={isPending}
              >
                Refuser le devis
              </Button>
            </div>

            {/* Fallback approve classique si le permit EIP-2612 ne fonctionne pas (ex: USDC Circle avec domaine EIP-712 non standard) */}
            {!acceptDevis.isSigned && !acceptDevis.hasEnoughAllowance && (
              <div className="mt-3 pt-3 border-t border-border/30">
                <p className="text-xs text-muted-foreground mb-2">
                  La signature ne passe pas ? Utilise l'approbation classique en 2 tx :
                </p>
                <Button
                  onClick={acceptDevis.approve}
                  disabled={isPending}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  {isPending && <Loader2 className="size-4 animate-spin" />}
                  Approve classique (fallback)
                </Button>
              </div>
            )}

            {acceptDevis.isSigned && (
              <p className="text-xs text-emerald-400 mt-2">
                ✓ Permit signé (valide 20 min) — confirmez la transaction de dépôt
              </p>
            )}
            {acceptDevis.hasEnoughAllowance && !acceptDevis.isSigned && (
              <p className="text-xs text-emerald-400 mt-2">
                ✓ Allowance USDC suffisante — vous pouvez déposer directement
              </p>
            )}
            {acceptDevis.error && (
              <p className="text-xs text-red-400 mt-2">{(acceptDevis.error as Error).message}</p>
            )}
          </ActionCard>
        )}

        {/* ── ARTISAN : valider un jalon ── */}
        {role === 'artisan' &&
          chantier.status === ChantierStatus.Active &&
          currentJalon?.status === JalonStatus.Pending && (
          <ActionCard title={`Demander le paiement — Jalon ${chantier.currentJalonIndex + 1} · ${formatToken(currentJalon?.amount ?? 0n)}`} icon={<CheckCircle2 className="size-5 text-[oklch(0.82_0.15_175)]" />}>
            <p className="text-sm text-muted-foreground mb-3">
              Déclarez ce jalon terminé. Vos preuves sont <strong className="text-foreground/80">horodatées on-chain</strong> à l'instant de soumission. Le client a ensuite <strong className="text-foreground/80">48h</strong> pour valider — sans réponse, le paiement est libéré automatiquement.
            </p>
            <div className="space-y-2 mb-4">
              <Label className="text-xs font-medium">
                Preuves d'exécution <span className="text-red-400 font-normal">(obligatoire)</span>
              </Label>
              <Input
                placeholder="Description des travaux, URL photos, lien CID IPFS, références facture fournisseur…"
                value={proofInput}
                onChange={e => setProofInput(e.target.value)}
                className="text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Vos preuves seront hashées (keccak256) puis horodatées on-chain à la seconde près. Elles sont opposables en cas de litige.
              </p>
              {proofInput.trim().length === 0 && (
                <p className="text-xs text-amber-400">
                  Renseignez une description précise, un lien photo ou un CID IPFS avant de demander le paiement.
                </p>
              )}
            </div>
            <Button
              onClick={handleValidateJalon}
              disabled={isPending || proofInput.trim().length === 0}
              className="bg-[oklch(0.82_0.15_175)] text-black hover:bg-[oklch(0.75_0.15_175)] gap-2"
            >
              {isPending && <Loader2 className="size-4 animate-spin" />}
              Soumettre les preuves et demander le paiement
            </Button>
          </ActionCard>
        )}

        {/* ── PARTICULIER : actions sur jalon Finished ── */}
        {role === 'particulier' &&
          chantier.status === ChantierStatus.Active &&
          currentJalon?.status === JalonStatus.Finished && (
          <ActionCard title="Valider ou refuser ce jalon" icon={<CheckCircle2 className="size-5 text-[oklch(0.82_0.15_175)]" />}>
            {/* Affichage des preuves artisan horodatées */}
            {currentJalon && currentJalon.finishedAt > 0n && (
              <div className="mb-4 rounded-lg border border-border/40 bg-white/[0.03] px-4 py-3 space-y-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="size-3.5" />
                  <span>Preuves soumises par l'artisan</span>
                </div>
                <p className="text-xs text-foreground/80">
                  Horodatage on-chain : <span className="font-mono text-emerald-400">
                    {new Date(Number(currentJalon.finishedAt) * 1000).toLocaleString('fr-FR')}
                  </span>
                </p>
                {currentJalon.artisanProofHash && currentJalon.artisanProofHash !== '0x0000000000000000000000000000000000000000000000000000000000000000' && (
                  <p className="text-xs text-muted-foreground">
                    Hash preuve : <span className="font-mono text-foreground/60">{currentJalon.artisanProofHash.slice(0, 18)}…{currentJalon.artisanProofHash.slice(-4)}</span>
                  </p>
                )}
              </div>
            )}

            {autoVal && (
              <p className={`text-sm mb-3 ${autoVal.expired ? 'text-emerald-400' : 'text-blue-400'}`}>
                <Clock className="size-3.5 inline mr-1" />
                {autoVal.expired
                  ? 'Le délai de 48 h est expiré — auto-validation possible'
                  : `Auto-validation dans ${autoVal.label} si vous ne réagissez pas`}
              </p>
            )}

            {/* Deux boutons principaux : Valider ou Refuser */}
            {!refuseOpen && (
              <>
                <p className="text-sm text-muted-foreground mb-4">
                  Examinez les preuves ci-dessus. Si les travaux sont conformes, validez le jalon. Sinon, vous pouvez refuser et choisir le mode de résolution.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => jalonActions.acceptJalon(chantierId)}
                    disabled={isPending}
                    className="bg-[oklch(0.82_0.15_175)] text-black hover:bg-[oklch(0.75_0.15_175)] gap-2"
                  >
                    {isPending && <Loader2 className="size-4 animate-spin" />}
                    <CheckCircle2 className="size-4" />
                    Valider et libérer le paiement
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => setRefuseOpen(true)}
                    disabled={isPending}
                  >
                    <XCircle className="size-4 mr-1" />
                    Je refuse ce jalon
                  </Button>
                </div>
              </>
            )}

            {/* Panneau de refus : justificatif + 2 options de résolution */}
            {refuseOpen && (
              <div className="space-y-4 border-t border-red-500/20 pt-4 -mx-6 px-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-red-400">Vous refusez ce jalon — justifiez votre refus</p>
                  <button
                    onClick={() => { setRefuseOpen(false); setClientProofInput('') }}
                    className="text-xs text-muted-foreground hover:text-foreground underline"
                  >
                    Annuler le refus
                  </button>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-medium">
                    Motif du refus <span className="text-red-400 font-normal">(obligatoire)</span>
                  </Label>
                  <Input
                    placeholder="Décrivez précisément les non-conformités constatées (photos, mesures, références aux devis…)"
                    value={clientProofInput}
                    onChange={e => setClientProofInput(e.target.value)}
                    className="text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Votre justificatif est hashé et horodaté on-chain. Il sera lu par l'artisan puis, si besoin, par le médiateur ou l'arbitre indépendant.
                  </p>
                </div>

                {clientProofInput.trim().length >= 10 ? (
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Comment souhaitez-vous procéder ?</p>

                    {/* Option 1 — Amiable */}
                    <button
                      onClick={handleMinorReserves}
                      disabled={isPending}
                      className="w-full text-left rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 hover:bg-amber-500/10 transition-colors disabled:opacity-50"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex size-8 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 flex-shrink-0 font-bold">
                          1
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-semibold text-amber-400">
                            Résoudre à l'amiable avec mon artisan
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Échange direct entre vous et l'artisan pour trouver une solution. 10 % du jalon reste bloqué comme caution. Votre artisan peut accepter les déductions (paiement partiel immédiat puis correction), ou refuser — dans ce cas la médiation s'ouvre automatiquement.
                          </p>
                          <p className="text-xs text-amber-400/80 italic pt-1">Délai recommandé : 7 jours</p>
                        </div>
                      </div>
                    </button>

                    {/* Option 2 — Médiation */}
                    <button
                      onClick={handleMajorReserves}
                      disabled={isPending}
                      className="w-full text-left rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-3 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex size-8 items-center justify-center rounded-full bg-red-500/20 text-red-400 flex-shrink-0 font-bold">
                          2
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-semibold text-red-400">
                            Engager un processus de médiation
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Le chantier est suspendu et 100 % du jalon reste bloqué. Un médiateur indépendant partenaire examine les preuves horodatées des deux parties et propose un pourcentage de répartition du jalon. En cas d'échec, le dossier complet vous est remis pour recours externe (juridique ou assurance) — c'est la sortie Trust BTP.
                          </p>
                          <p className="text-xs text-red-400/80 italic pt-1">Médiation : 30 jours · puis recours externe si aucun accord</p>
                        </div>
                      </div>
                    </button>

                    {isPending && (
                      <p className="text-xs text-muted-foreground flex items-center gap-2">
                        <Loader2 className="size-3 animate-spin" />
                        Transaction en cours…
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">
                    Rédigez un motif d'au moins 10 caractères pour débloquer les options de résolution.
                  </p>
                )}
              </div>
            )}
          </ActionCard>
        )}

        {/* ── Auto-validation disponible (n'importe qui) ── */}
        {chantier.status === ChantierStatus.Active &&
          currentJalon?.status === JalonStatus.Finished &&
          autoVal?.expired && (
          <ActionCard title="Auto-validation disponible" icon={<Clock className="size-5 text-emerald-400" />}>
            <p className="text-sm text-muted-foreground mb-3">
              48h se sont écoulées sans réaction du particulier. N'importe qui peut déclencher la validation automatique.
            </p>
            <Button
              onClick={() => jalonActions.triggerAutoValidation(chantierId)}
              disabled={isPending}
              variant="outline"
              className="gap-2"
            >
              {isPending && <Loader2 className="size-4 animate-spin" />}
              Déclencher l'auto-validation
            </Button>
          </ActionCard>
        )}

        {/* ── ARTISAN : réponse à un refus amiable du particulier ── */}
        {role === 'artisan' &&
          chantier.status === ChantierStatus.Active &&
          currentJalon?.status === JalonStatus.AcceptedWithReserves && (
          <ActionCard title="Le client a refusé ce jalon — résolution amiable" icon={<AlertTriangle className="size-5 text-amber-400" />}>
            <p className="text-sm text-muted-foreground mb-2">
              Le client demande une résolution à l'amiable. Vous avez deux choix :
            </p>
            <ul className="text-sm text-muted-foreground mb-4 space-y-1">
              <li>• <strong className="text-foreground/90">J'accepte les déductions</strong> : vous recevez immédiatement {formatToken(currentJalon.amount - currentJalon.blockedAmount - currentJalon.penaltyAmount)} (87 %). {formatToken(currentJalon.blockedAmount)} restent bloqués jusqu'à correction et levée des réserves par le client.</li>
              <li>• <strong className="text-foreground/90">Je conteste</strong> : la médiation s'ouvre automatiquement. Un médiateur indépendant examine les preuves des deux parties avant qu'un arbitre tranche si besoin.</li>
            </ul>
            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={() => jalonActions.acknowledgeReserves(chantierId, true)}
                disabled={isPending}
                className="bg-[oklch(0.82_0.15_175)] text-black hover:bg-[oklch(0.75_0.15_175)] gap-2"
              >
                {isPending && <Loader2 className="size-4 animate-spin" />}
                J'accepte les déductions
              </Button>
              <Button
                variant="destructive"
                onClick={() => jalonActions.acknowledgeReserves(chantierId, false)}
                disabled={isPending}
              >
                <ShieldOff className="size-4 mr-1" />
                Je conteste → ouvre la médiation
              </Button>
            </div>
          </ActionCard>
        )}

        {/* ── PARTICULIER : lever les réserves ── */}
        {role === 'particulier' &&
          chantier.status === ChantierStatus.Active &&
          currentJalon?.status === JalonStatus.PaidWithReserves && (
          <ActionCard title="Lever les réserves" icon={<CheckCircle2 className="size-5 text-emerald-400" />}>
            <p className="text-sm text-muted-foreground mb-4">
              L'artisan a corrigé les points soulevés. En levant les réserves, vous libérez les {formatToken(currentJalon.blockedAmount)} bloqués.
            </p>
            <Button
              onClick={() => jalonActions.lifterReserves(chantierId)}
              disabled={isPending}
              className="bg-[oklch(0.82_0.15_175)] text-black hover:bg-[oklch(0.75_0.15_175)] gap-2"
            >
              {isPending && <Loader2 className="size-4 animate-spin" />}
              Lever les réserves
            </Button>
          </ActionCard>
        )}

        {/* ── Chantier en pause (réserves majeures) ── */}
        {chantier.status === ChantierStatus.Paused &&
          (role === 'particulier') && (
          <ActionCard title="Chantier suspendu — réserves majeures" icon={<AlertTriangle className="size-5 text-amber-400" />}>
            <p className="text-sm text-muted-foreground mb-4">
              Le chantier est en pause suite à des réserves majeures. Reprenez le chantier
              une fois les problèmes résolus — le jalon courant sera remis à zéro.
            </p>
            <Button
              onClick={() => jalonActions.resumeChantier(chantierId)}
              disabled={isPending}
              variant="outline"
              className="gap-2"
            >
              <RotateCcw className="size-4" />
              Reprendre le chantier
            </Button>
          </ActionCard>
        )}

        {/* ── En litige ── */}
        {chantier.status === ChantierStatus.InLitige && (
          <ActionCard title="Litige en cours" icon={<ShieldOff className="size-5 text-red-400" />}>
            <p className="text-sm text-muted-foreground mb-4">
              L'arbitre doit résoudre ce litige. En attente de sa décision.
              Le score de l'artisan est gelé pendant la procédure.
            </p>
            {/* Panel arbitre — visible si l'adresse ne correspond à aucune partie */}
            {role === 'viewer' && (
              <div className="space-y-4 border-t border-border/30 pt-4">
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Décision de l'arbitre</p>

                {/* Responsabilité */}
                <div className="space-y-1.5">
                  <Label className="text-xs">Qui est en tort ?</Label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setArtisanEnTort(true)}
                      className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                        artisanEnTort
                          ? 'border-red-500/40 bg-red-500/10 text-red-400'
                          : 'border-border/50 text-muted-foreground hover:bg-white/5'
                      }`}
                    >
                      Artisan en tort
                    </button>
                    <button
                      onClick={() => setArtisanEnTort(false)}
                      className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                        !artisanEnTort
                          ? 'border-amber-500/40 bg-amber-500/10 text-amber-400'
                          : 'border-border/50 text-muted-foreground hover:bg-white/5'
                      }`}
                    >
                      Particulier en tort
                    </button>
                  </div>
                </div>

                {/* Retenue plateforme */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Retenue plateforme</Label>
                    <span className="text-sm font-semibold tabular-nums">
                      {(Number(blockedBps) / 100).toFixed(1)}%
                    </span>
                  </div>
                  <input
                    type="range" min="0" max="10000" step="100"
                    value={blockedBps}
                    onChange={e => setBlockedBps(e.target.value)}
                    className="w-full h-1.5 rounded-full appearance-none bg-white/10 accent-[oklch(0.82_0.15_175)] cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0%</span><span>50%</span><span>100%</span>
                  </div>
                </div>

                {/* Pénalité */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Pénalité supplémentaire <span className="text-muted-foreground">(max 50%)</span></Label>
                    <span className="text-sm font-semibold tabular-nums">
                      {(Number(penaltyBps) / 100).toFixed(1)}%
                    </span>
                  </div>
                  <input
                    type="range" min="0" max="5000" step="100"
                    value={penaltyBps}
                    onChange={e => setPenaltyBps(e.target.value)}
                    className="w-full h-1.5 rounded-full appearance-none bg-white/10 accent-[oklch(0.82_0.15_175)] cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0%</span><span>25%</span><span>50%</span>
                  </div>
                </div>

                {/* Récap */}
                {currentJalon && (
                  <div className="rounded-lg bg-white/[0.03] border border-border/30 px-4 py-3 text-xs text-muted-foreground space-y-1">
                    <p className="font-medium text-foreground/70 mb-2">Récapitulatif de la décision</p>
                    <p>· Retenue plateforme : <span className="text-foreground">{formatToken(currentJalon.amount * BigInt(blockedBps) / 10000n)}</span></p>
                    <p>· Pénalité : <span className="text-foreground">{formatToken(currentJalon.amount * BigInt(penaltyBps) / 10000n)}</span></p>
                    <p>· Partie en tort perd : <span className="text-red-400">{((Number(blockedBps) + Number(penaltyBps)) / 100).toFixed(1)}%</span></p>
                  </div>
                )}

                <Button
                  onClick={() => jalonActions.resolveLitige(
                    chantierId,
                    artisanEnTort,
                    BigInt(blockedBps),
                    BigInt(penaltyBps)
                  )}
                  disabled={isPending}
                  className="w-full gap-2"
                >
                  {isPending && <Loader2 className="size-4 animate-spin" />}
                  Confirmer la résolution
                </Button>
              </div>
            )}
          </ActionCard>
        )}

        {/* ── PARTICULIER : annuler avant le 1er jalon ── */}
        {role === 'particulier' &&
          chantier.status === ChantierStatus.Active &&
          chantier.currentJalonIndex === 0 &&
          currentJalon?.status === JalonStatus.Pending && (
          <ActionCard title="Annuler le chantier" icon={<XCircle className="size-5 text-red-400" />}>
            <p className="text-sm text-muted-foreground mb-4">
              L'artisan n'a pas encore démarré. En annulant, il reçoit le montant du 1er jalon ({formatToken(jalons[0]?.amount ?? 0n)})
              en compensation et vous récupérez le reste.
            </p>
            <Button
              variant="destructive"
              onClick={() => jalonActions.cancelChantier(chantierId)}
              disabled={isPending}
              className="gap-2"
            >
              {isPending && <Loader2 className="size-4 animate-spin" />}
              Annuler le chantier
            </Button>
          </ActionCard>
        )}

        {/* ── Chantier terminé ── */}
        {chantier.status === ChantierStatus.Completed && (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-6 text-center space-y-2">
            <CheckCircle2 className="size-10 text-emerald-400 mx-auto" />
            <h3 className="font-bold text-lg">Chantier terminé</h3>
            <p className="text-sm text-muted-foreground">
              Tous les jalons ont été validés. Le buffer de 10% a été retourné au particulier.
            </p>
          </div>
        )}

        {/* Erreur transaction */}
        {jalonActions.error && (
          <Alert variant="destructive">
            <AlertDescription className="text-sm">
              {(jalonActions.error as Error).message}
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  )
}

// Carte d'action réutilisable
function ActionCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border/50 bg-card p-5">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h3 className="font-semibold">{title}</h3>
      </div>
      {children}
    </div>
  )
}
