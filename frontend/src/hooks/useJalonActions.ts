'use client'

import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { ESCROW_VAULT_ADDRESS, ESCROW_VAULT_ABI } from '@/lib/contracts'

// Toutes les actions liées aux jalons et au cycle de vie du chantier
export function useJalonActions(onSuccess?: () => void) {
  const { writeContract, data: hash, isPending, error, reset } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  if (isSuccess && onSuccess) onSuccess()

  function rejectDevis(chantierId: bigint) {
    writeContract({ address: ESCROW_VAULT_ADDRESS, abi: ESCROW_VAULT_ABI, functionName: 'rejectDevis', args: [chantierId] })
  }

  function validateJalon(chantierId: bigint, proofHash: `0x${string}`) {
    writeContract({ address: ESCROW_VAULT_ADDRESS, abi: ESCROW_VAULT_ABI, functionName: 'validateJalon', args: [chantierId, proofHash] })
  }

  function acceptJalon(chantierId: bigint) {
    writeContract({ address: ESCROW_VAULT_ADDRESS, abi: ESCROW_VAULT_ABI, functionName: 'acceptJalon', args: [chantierId] })
  }

  function triggerAutoValidation(chantierId: bigint) {
    writeContract({ address: ESCROW_VAULT_ADDRESS, abi: ESCROW_VAULT_ABI, functionName: 'triggerAutoValidation', args: [chantierId] })
  }

  function acceptJalonWithMinorReserves(chantierId: bigint, clientProofHash: `0x${string}`) {
    writeContract({ address: ESCROW_VAULT_ADDRESS, abi: ESCROW_VAULT_ABI, functionName: 'acceptJalonWithMinorReserves', args: [chantierId, clientProofHash] })
  }

  function acceptJalonWithMajorReserves(chantierId: bigint, clientProofHash: `0x${string}`) {
    writeContract({ address: ESCROW_VAULT_ADDRESS, abi: ESCROW_VAULT_ABI, functionName: 'acceptJalonWithMajorReserves', args: [chantierId, clientProofHash] })
  }

  function acknowledgeReserves(chantierId: bigint, accept: boolean) {
    writeContract({ address: ESCROW_VAULT_ADDRESS, abi: ESCROW_VAULT_ABI, functionName: 'acknowledgeReserves', args: [chantierId, accept] })
  }

  function lifterReserves(chantierId: bigint) {
    writeContract({ address: ESCROW_VAULT_ADDRESS, abi: ESCROW_VAULT_ABI, functionName: 'lifterReserves', args: [chantierId] })
  }

  function cancelChantier(chantierId: bigint) {
    writeContract({ address: ESCROW_VAULT_ADDRESS, abi: ESCROW_VAULT_ABI, functionName: 'cancelChantier', args: [chantierId] })
  }

  function resumeChantier(chantierId: bigint) {
    writeContract({ address: ESCROW_VAULT_ADDRESS, abi: ESCROW_VAULT_ABI, functionName: 'resumeChantier', args: [chantierId] })
  }

  function resolveLitige(chantierId: bigint, artisanEnTort: boolean, blockedBps: bigint, penaltyBps: bigint) {
    writeContract({ address: ESCROW_VAULT_ADDRESS, abi: ESCROW_VAULT_ABI, functionName: 'resolveLitige', args: [chantierId, artisanEnTort, blockedBps, penaltyBps] })
  }

  return {
    rejectDevis,
    validateJalon,
    acceptJalon,
    triggerAutoValidation,
    acceptJalonWithMinorReserves,
    acceptJalonWithMajorReserves,
    acknowledgeReserves,
    lifterReserves,
    cancelChantier,
    resumeChantier,
    resolveLitige,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
    hash,
    reset,
  }
}
