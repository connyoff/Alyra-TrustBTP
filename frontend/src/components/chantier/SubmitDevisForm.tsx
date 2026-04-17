'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Loader2, CheckCircle2 } from 'lucide-react'
import { useSubmitDevis } from '@/hooks/useSubmitDevis'
import { TOKEN_ADDRESS } from '@/lib/contracts'
import { parseToken, formatToken } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface JalonField {
  description: string
  amount: string
  deadline: string
}

const DEFAULT_JALON: JalonField = { description: '', amount: '', deadline: '' }

function dateToTimestamp(dateStr: string): bigint {
  if (!dateStr) return 0n
  // Interprétation en heure locale pour éviter le décalage UTC
  return BigInt(Math.floor(new Date(dateStr + 'T00:00:00').getTime() / 1000))
}

export function SubmitDevisForm() {
  const router = useRouter()
  const [particulier, setParticulier] = useState('')
  const [nomChantier, setNomChantier] = useState('')
  const [jalons, setJalons] = useState<JalonField[]>([{ ...DEFAULT_JALON }, { ...DEFAULT_JALON }])
  const { submitDevis, isPending, isSuccess, error } = useSubmitDevis()

  const totalAmount = jalons.reduce((sum, j) => sum + parseToken(j.amount), 0n)
  const today = new Date().toISOString().split('T')[0]
  const allFilled = particulier.startsWith('0x') && particulier.length === 42 &&
    nomChantier.trim().length > 0 &&
    jalons.every(j => j.description.trim() && parseToken(j.amount) > 0n && j.deadline !== '')

  function addJalon() {
    if (jalons.length < 5) setJalons([...jalons, { ...DEFAULT_JALON }])
  }

  function removeJalon(idx: number) {
    if (jalons.length > 1) setJalons(jalons.filter((_, i) => i !== idx))
  }

  function updateJalon(idx: number, field: keyof JalonField, value: string) {
    setJalons(jalons.map((j, i) => i === idx ? { ...j, [field]: value } : j))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!allFilled) return
    submitDevis(
      particulier as `0x${string}`,
      TOKEN_ADDRESS,
      totalAmount,
      nomChantier.trim(),
      jalons.map(j => j.description),
      jalons.map(j => parseToken(j.amount)),
      jalons.map(j => dateToTimestamp(j.deadline))
    )
  }

  if (isSuccess) {
    return (
      <Card className="border-border/50 bg-card">
        <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[oklch(0.82_0.15_175)]/10 ring-1 ring-[oklch(0.82_0.15_175)]/20">
            <CheckCircle2 className="size-8 text-[oklch(0.82_0.15_175)]" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Devis soumis</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Le particulier a été notifié et peut maintenant signer le devis.
            </p>
          </div>
          <Button onClick={() => router.push('/')} className="bg-[oklch(0.82_0.15_175)] text-black hover:bg-[oklch(0.75_0.15_175)]">
            Retour au tableau de bord
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Nom du chantier */}
      <div className="space-y-2">
        <Label htmlFor="nomChantier">Nom du chantier</Label>
        <Input
          id="nomChantier"
          placeholder="Ex : Rénovation salle de bain, Extension terrasse..."
          value={nomChantier}
          onChange={e => setNomChantier(e.target.value)}
          className="text-sm"
        />
      </div>

      {/* Adresse du particulier */}
      <div className="space-y-2">
        <Label htmlFor="particulier">Adresse du client (particulier)</Label>
        <Input
          id="particulier"
          placeholder="0x..."
          value={particulier}
          onChange={e => setParticulier(e.target.value)}
          className="font-mono text-sm"
        />
      </div>

      {/* Jalons */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Jalons <span className="text-muted-foreground text-xs">({jalons.length}/5)</span></Label>
          <div className="h-1 flex-1 mx-4 rounded-full bg-white/5">
            {/* mini résumé visuel */}
          </div>
          <span className="text-sm font-semibold text-[oklch(0.82_0.15_175)]">
            Total : {formatToken(totalAmount)}
          </span>
        </div>

        {jalons.map((jalon, idx) => (
          <Card key={idx} className="border-border/40 bg-card/50">
            <CardContent className="py-3 px-4">
              <div className="flex items-start gap-3">
                <span className="mt-2.5 text-xs font-medium text-muted-foreground w-5 text-right flex-shrink-0">
                  {idx + 1}
                </span>
                <div className="flex-1 flex items-end gap-2">
                  <Input
                    placeholder="Description du jalon"
                    value={jalon.description}
                    onChange={e => updateJalon(idx, 'description', e.target.value)}
                    className="text-sm flex-1 min-w-0"
                  />
                  <Input
                    placeholder="Montant USDC"
                    type="number"
                    min="0"
                    step="0.01"
                    value={jalon.amount}
                    onChange={e => updateJalon(idx, 'amount', e.target.value)}
                    className="text-sm w-32 flex-shrink-0"
                  />
                  <div className="flex flex-col gap-1 flex-shrink-0">
                    <span className="text-xs text-muted-foreground px-1">Date fin de réalisation</span>
                    <Input
                      type="date"
                      min={today}
                      value={jalon.deadline}
                      onChange={e => updateJalon(idx, 'deadline', e.target.value)}
                      className="text-sm w-44"
                    />
                  </div>
                  {jalons.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeJalon(idx)}
                      className="flex-shrink-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {jalons.length < 5 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addJalon}
            className="w-full border-dashed gap-1 text-muted-foreground hover:text-foreground"
          >
            <Plus className="size-4" /> Ajouter un jalon
          </Button>
        )}
      </div>

      {/* Récapitulatif dépôt */}
      {totalAmount > 0n && (
        <div className="rounded-lg border border-[oklch(0.82_0.15_175)]/20 bg-[oklch(0.82_0.15_175)]/5 px-4 py-3 space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Montant devis</span>
            <span>{formatToken(totalAmount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Dépôt demandé (110%)</span>
            <span className="font-semibold text-[oklch(0.82_0.15_175)]">
              {formatToken((totalAmount * 11n) / 10n)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground pt-1">
            Le client devra approuver ce montant en USDC avant de signer.
          </p>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription className="text-sm">{(error as Error).message}</AlertDescription>
        </Alert>
      )}

      <Button
        type="submit"
        disabled={!allFilled || isPending}
        className="w-full bg-[oklch(0.82_0.15_175)] text-black hover:bg-[oklch(0.75_0.15_175)] disabled:opacity-50 gap-2"
      >
        {isPending && <Loader2 className="size-4 animate-spin" />}
        {isPending ? 'Transaction en cours...' : 'Soumettre le devis'}
      </Button>
    </form>
  )
}
