'use client'

import { useAccount, useReadContract } from 'wagmi'
import { ESCROW_VAULT_ADDRESS, ESCROW_VAULT_ABI } from '@/lib/contracts'

export function useIsOwner() {
  const { address } = useAccount()

  const { data: ownerAddress, isLoading } = useReadContract({
    address: ESCROW_VAULT_ADDRESS,
    abi: ESCROW_VAULT_ABI,
    functionName: 'owner',
  })

  const isOwner = !!(
    address &&
    ownerAddress &&
    address.toLowerCase() === (ownerAddress as string).toLowerCase()
  )

  return { isOwner, ownerAddress: ownerAddress as `0x${string}` | undefined, isLoading }
}
