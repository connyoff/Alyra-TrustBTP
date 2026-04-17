'use client'

/**
 * OnboardingFlow — orchestre les étapes d'entrée :
 *   1. ChoosePersona      (Particulier / Artisan)
 *   2. MoneriumKYC        (KYC adapté selon le persona choisi)
 *      → l'artisan a en plus : SIRET + Kbis + Attestation décennale
 *
 * Option power user : lien discret dans le KYC pour basculer vers
 * la connexion wallet (Rabby / MetaMask via Reown AppKit).
 */

import { useState } from 'react'
import { ChoosePersona } from './ChoosePersona'
import { MoneriumKYC } from './MoneriumKYC'
import { ChooseLogin } from './ChooseLogin'

type Step = 'choose-persona' | 'kyc' | 'wallet-choice'
export type Persona = 'particulier' | 'artisan'

type Props = {
  onKycComplete: () => void
}

export function OnboardingFlow({ onKycComplete }: Props) {
  const [step, setStep] = useState<Step>('choose-persona')
  const [persona, setPersona] = useState<Persona>('particulier')

  if (step === 'wallet-choice') {
    return <ChooseLogin onChooseMonerium={() => setStep('kyc')} />
  }

  if (step === 'kyc') {
    return (
      <MoneriumKYC
        persona={persona}
        onBack={() => setStep('choose-persona')}
        onComplete={onKycComplete}
        onSwitchToWallet={() => setStep('wallet-choice')}
      />
    )
  }

  // Default: choix persona
  return (
    <ChoosePersona
      onChoose={(p) => {
        setPersona(p)
        setStep('kyc')
      }}
      onCancel={() => window.location.reload()}
    />
  )
}
