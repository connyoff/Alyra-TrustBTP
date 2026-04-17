'use client'

import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { ESCROW_VAULT_ADDRESS, ESCROW_VAULT_ABI } from '@/lib/contracts'

// Hook artisan — soumet un devis
export function useSubmitDevis() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  function submitDevis(
    particulier: `0x${string}`,
    token: `0x${string}`,
    devisAmount: bigint,
    name: string,
    descriptions: string[],
    amounts: bigint[],
    deadlines: bigint[]
  ) {
    writeContract({
      address: ESCROW_VAULT_ADDRESS,
      abi: ESCROW_VAULT_ABI,
      functionName: 'submitDevis',
      args: [particulier, token, devisAmount, name, descriptions, amounts, deadlines],
    })
  }

  return {
    submitDevis,
    isPending: isPending || isConfirming,
    isSuccess,
    error,
    hash,
  }
}
