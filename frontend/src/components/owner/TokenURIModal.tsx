'use client'

import { useState } from 'react'
import { Loader2, X, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTokenURI } from '@/hooks/useTokenURI'

interface TokenURIModalProps {
  chantierId: bigint
  chantierName: string
}

interface JalonMeta {
  index: number
  description: string
  montant: number
  statut: number
}

const JALON_STATUT_LABEL: Record<number, string> = {
  0: 'En attente',
  1: 'Preuve soumise',
  2: 'Validé',
  3: 'Réserves posées',
  4: 'Payé avec réserves',
  5: 'En litige',
  6: 'Réserves levées',
}

export function TokenURIModal({ chantierId, chantierName }: TokenURIModalProps) {
  const [open, setOpen] = useState(false)
  const { metadata, isLoading, isError } = useTokenURI(chantierId, open)

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="h-7 px-2 text-xs gap-1"
        onClick={() => setOpen(true)}
      >
        <FileText className="size-3" />
        NFT
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full max-w-lg mx-4 rounded-xl border border-border bg-card shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div>
                <p className="text-xs text-muted-foreground">Token #{chantierId.toString()}</p>
                <h2 className="font-semibold text-sm">{chantierName}</h2>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Body */}
            <div className="px-5 py-4 max-h-[70vh] overflow-y-auto space-y-4">
              {isLoading && (
                <div className="flex items-center gap-2 text-muted-foreground py-6 justify-center">
                  <Loader2 className="size-4 animate-spin" />
                  Chargement du NFT…
                </div>
              )}

              {isError && (
                <p className="text-sm text-red-400 text-center py-6">
                  NFT non disponible pour ce chantier.
                </p>
              )}

              {metadata && (
                <>
                  {/* Attributs principaux */}
                  <div className="grid grid-cols-2 gap-2">
                    {(metadata.attributes as { trait_type: string; value: string }[])?.map(
                      (attr) => (
                        <div
                          key={attr.trait_type}
                          className="rounded-lg bg-muted/40 px-3 py-2"
                        >
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                            {attr.trait_type}
                          </p>
                          <p className="text-xs font-medium mt-0.5 break-all">{attr.value}</p>
                        </div>
                      )
                    )}
                  </div>

                  {/* Jalons */}
                  {metadata.jalons?.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
                        Jalons
                      </p>
                      <div className="space-y-1.5">
                        {(metadata.jalons as JalonMeta[]).map((j) => (
                          <div
                            key={j.index}
                            className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2 text-xs"
                          >
                            <span className="text-muted-foreground mr-2 shrink-0">
                              #{j.index + 1}
                            </span>
                            <span className="flex-1 truncate">{j.description}</span>
                            <span className="ml-3 shrink-0 text-[oklch(0.82_0.15_175)] font-medium">
                              {j.montant} USDC
                            </span>
                            <span className="ml-3 shrink-0 text-muted-foreground">
                              {JALON_STATUT_LABEL[j.statut] ?? j.statut}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
