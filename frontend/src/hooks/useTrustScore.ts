'use client'

import { useReadContract } from 'wagmi'
import { TRUST_SCORE_REGISTRY_ADDRESS, TRUST_SCORE_REGISTRY_ABI } from '@/lib/contracts'
import { TrustStats, TrustTier } from '@/types/contracts'

export function useTrustScore(artisanAddress: `0x${string}` | undefined) {
  const { data, isPending, refetch } = useReadContract({
    address: TRUST_SCORE_REGISTRY_ADDRESS,
    abi: TRUST_SCORE_REGISTRY_ABI,
    functionName: 'getStats',
    args: [artisanAddress ?? '0x0000000000000000000000000000000000000000'],
    query: { enabled: !!artisanAddress },
  })

  const stats: TrustStats | undefined = data
    ? {
        score: data[0],
        tier: data[1] as TrustTier,
        chantiersCompleted: data[2],
        litigesCount: data[3],
        frozen: data[4],
      }
    : undefined

  return { stats, isLoading: isPending, refetch }
}
