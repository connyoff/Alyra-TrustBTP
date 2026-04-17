'use client'

import { useReadContract } from 'wagmi'
import { CHANTIER_NFT_ADDRESS, CHANTIER_NFT_ABI } from '@/lib/contracts'

// Charge le tokenURI d'un NFT de manière paresseuse (uniquement si enabled=true)
export function useTokenURI(chantierId: bigint, enabled: boolean) {
  const { data: uri, isLoading, isError } = useReadContract({
    address: CHANTIER_NFT_ADDRESS,
    abi: CHANTIER_NFT_ABI,
    functionName: 'tokenURI',
    args: [chantierId],
    query: { enabled },
  })

  const metadata = (() => {
    if (!uri) return null
    try {
      const base64 = (uri as string).replace('data:application/json;base64,', '')
      return JSON.parse(atob(base64))
    } catch {
      return null
    }
  })()

  return { uri: uri as string | undefined, metadata, isLoading, isError }
}
