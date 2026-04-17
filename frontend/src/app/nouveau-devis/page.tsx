'use client'

import { useAccount } from 'wagmi'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { SubmitDevisForm } from '@/components/chantier/SubmitDevisForm'
import { TrustScoreBadge } from '@/components/chantier/TrustScoreBadge'

export default function NouveauDevisPage() {
  const { isConnected, address } = useAccount()
  const router = useRouter()

  useEffect(() => {
    if (!isConnected) router.push('/')
  }, [isConnected, router])

  if (!isConnected) return null

  return (
    <div className="container max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nouveau devis</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Créez un devis pour un particulier. Définissez vos jalons et leurs montants.
          </p>
        </div>
        <TrustScoreBadge artisanAddress={address} compact />
      </div>

      <div className="rounded-xl border border-border/50 bg-card p-6">
        <SubmitDevisForm />
      </div>
    </div>
  )
}
