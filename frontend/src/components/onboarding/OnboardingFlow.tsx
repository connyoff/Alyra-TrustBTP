'use client'

/**
 * OnboardingFlow — flow simplifié :
 *
 *   Landing → KYC Monerium (par défaut) → Dashboard
 *
 * Option power user : lien discret dans le KYC pour basculer vers
 * la connexion wallet (Rabby / MetaMask via Reown AppKit).
 *
 * Textes : src/config/content.ts
 */

import { useState } from 'react'
import { ChooseLogin } from './ChooseLogin'
import { MoneriumKYC } from './MoneriumKYC'

type Step = 'kyc' | 'wallet-choice'

type Props = {
  onKycComplete: () => void
}

export function OnboardingFlow({ onKycComplete }: Props) {
  const [step, setStep] = useState<Step>('kyc')

  if (step === 'wallet-choice') {
    return <ChooseLogin onChooseMonerium={() => setStep('kyc')} />
  }

  // Default: KYC Monerium (Web3 invisible)
  return (
    <MoneriumKYC
      onBack={() => window.location.reload()} // retour à la landing
      onComplete={onKycComplete}
      onSwitchToWallet={() => setStep('wallet-choice')}
    />
  )
}
