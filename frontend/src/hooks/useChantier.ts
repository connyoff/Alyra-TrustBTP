'use client'

import { useReadContract } from 'wagmi'
import { ESCROW_VAULT_ADDRESS, ESCROW_VAULT_ABI } from '@/lib/contracts'
import { Chantier, ChantierStatus, Jalon } from '@/types/contracts'

// Lit les données complètes d'un chantier (struct + jalons)
export function useChantier(chantierId: bigint | undefined) {
  const { data: raw, isPending: loadingChantier, refetch: refetchChantier } = useReadContract({
    address: ESCROW_VAULT_ADDRESS,
    abi: ESCROW_VAULT_ABI,
    functionName: 'chantiers',
    args: [chantierId ?? 0n],
    query: { enabled: chantierId !== undefined },
  })

  const { data: jalonsRaw, isPending: loadingJalons, refetch: refetchJalons } = useReadContract({
    address: ESCROW_VAULT_ADDRESS,
    abi: ESCROW_VAULT_ABI,
    functionName: 'getAllJalons',
    args: [chantierId ?? 0n],
    query: { enabled: chantierId !== undefined },
  })

  const chantier: Chantier | undefined = raw
    ? {
        id: raw[0] as bigint,
        name: raw[1] as string,
        artisan: raw[2] as `0x${string}`,
        particulier: raw[3] as `0x${string}`,
        token: raw[4] as `0x${string}`,
        devisAmount: raw[5] as bigint,
        depositAmount: raw[6] as bigint,
        yieldOptIn: raw[7] as boolean,
        status: Number(raw[8]) as ChantierStatus,
        currentJalonIndex: Number(raw[9]),
        jalonCount: Number(raw[10]),
        submittedAt: raw[11] as bigint,
        acceptedAt: raw[12] as bigint,
        completedAt: raw[13] as bigint,
      }
    : undefined

  const jalons: Jalon[] = (jalonsRaw as Jalon[] | undefined) ?? []

  function refetch() {
    refetchChantier()
    refetchJalons()
  }

  return {
    chantier,
    jalons,
    isLoading: loadingChantier || loadingJalons,
    refetch,
  }
}
