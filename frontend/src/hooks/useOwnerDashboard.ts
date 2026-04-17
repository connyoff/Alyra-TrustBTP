'use client'

import { useState, useEffect } from 'react'
import { parseAbiItem } from 'viem'
import { useReadContracts } from 'wagmi'
import { publicClient, DEPLOY_FROM_BLOCK } from '@/lib/client'
import {
  ESCROW_VAULT_ADDRESS,
  TOKEN_ADDRESS,
  ESCROW_VAULT_ABI,
  YIELD_PROVIDER_ABI,
} from '@/lib/contracts'
import { ChantierStatus } from '@/types/contracts'

export type CompletedChantierRow = {
  id: bigint
  name: string
  devisAmount: bigint
  platformFees: bigint
  completedAt: bigint
}

export type LitigeChantierRow = {
  id: bigint
  name: string
  artisan: `0x${string}`
  particulier: `0x${string}`
  devisAmount: bigint
  jalonIndex: number
}

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000' as `0x${string}`

export function useOwnerDashboard() {
  const [completedIds, setCompletedIds] = useState<bigint[]>([])
  const [litigeIds, setLitigeIds] = useState<bigint[]>([])
  const [litigeJalonMap, setLitigeJalonMap] = useState<Map<bigint, number>>(new Map())
  const [isLoadingIds, setIsLoadingIds] = useState(true)

  // 1. Fetch ChantierTermine + LitigeOuvert events en parallèle
  useEffect(() => {
    const fetchCompleted = publicClient
      .getLogs({
        address: ESCROW_VAULT_ADDRESS,
        event: parseAbiItem('event ChantierTermine(uint256 indexed chantierId)'),
        fromBlock: DEPLOY_FROM_BLOCK,
        toBlock: 'latest',
      })
      .then(logs =>
        logs
          .filter(l => l.args.chantierId !== undefined)
          .map(l => l.args.chantierId!)
          .sort((a, b) => (b > a ? 1 : -1))
      )

    const fetchLitige = publicClient
      .getLogs({
        address: ESCROW_VAULT_ADDRESS,
        event: parseAbiItem(
          'event LitigeOuvert(uint256 indexed chantierId, uint8 jalonIndex)'
        ),
        fromBlock: DEPLOY_FROM_BLOCK,
        toBlock: 'latest',
      })
      .then(logs => {
        // Déduplique par chantierId — conserve le dernier jalonIndex si plusieurs litiges
        const map = new Map<bigint, number>()
        for (const log of logs) {
          if (log.args.chantierId !== undefined && log.args.jalonIndex !== undefined) {
            map.set(log.args.chantierId, Number(log.args.jalonIndex))
          }
        }
        return map
      })

    Promise.all([fetchCompleted, fetchLitige])
      .then(([ids, jalonMap]) => {
        setCompletedIds(ids)
        setLitigeJalonMap(jalonMap)
        setLitigeIds([...jalonMap.keys()])
      })
      .catch(console.error)
      .finally(() => setIsLoadingIds(false))
  }, [])

  // 2a. Stats globales
  const { data: statsData, isLoading: isLoadingStats } = useReadContracts({
    contracts: [
      {
        address: ESCROW_VAULT_ADDRESS,
        abi: ESCROW_VAULT_ABI,
        functionName: 'platformFees',
        args: [TOKEN_ADDRESS],
      },
      {
        address: ESCROW_VAULT_ADDRESS,
        abi: ESCROW_VAULT_ABI,
        functionName: 'yieldProvider',
      },
      {
        address: ESCROW_VAULT_ADDRESS,
        abi: ESCROW_VAULT_ABI,
        functionName: 'yieldPrincipal',
        args: [TOKEN_ADDRESS],
      },
    ],
  })

  const platformFeesTotal = (statsData?.[0]?.result ?? 0n) as bigint
  const yieldProviderAddress = (statsData?.[1]?.result ?? ZERO_ADDRESS) as `0x${string}`
  const yieldPrincipal = (statsData?.[2]?.result ?? 0n) as bigint
  const hasYieldProvider = !!yieldProviderAddress && yieldProviderAddress !== ZERO_ADDRESS

  // 2b. Multicall chantiers terminés
  const { data: chantiersData, isLoading: isLoadingChantiers } = useReadContracts({
    contracts: completedIds.map(id => ({
      address: ESCROW_VAULT_ADDRESS,
      abi: ESCROW_VAULT_ABI,
      functionName: 'chantiers' as const,
      args: [id] as const,
    })),
    query: { enabled: !isLoadingIds && completedIds.length > 0 },
  })

  // 2c. Multicall chantiers en litige (pour vérifier le status courant)
  const { data: litigeData, isLoading: isLoadingLitige } = useReadContracts({
    contracts: litigeIds.map(id => ({
      address: ESCROW_VAULT_ADDRESS,
      abi: ESCROW_VAULT_ABI,
      functionName: 'chantiers' as const,
      args: [id] as const,
    })),
    query: { enabled: !isLoadingIds && litigeIds.length > 0 },
  })

  // 3. Yield global
  const { data: yieldData } = useReadContracts({
    contracts: hasYieldProvider
      ? [
          {
            address: yieldProviderAddress,
            abi: YIELD_PROVIDER_ABI,
            functionName: 'pendingYield',
            args: [TOKEN_ADDRESS, yieldPrincipal],
          },
        ]
      : [],
    query: { enabled: hasYieldProvider && !isLoadingStats },
  })

  const yieldTotal = hasYieldProvider ? ((yieldData?.[0]?.result ?? 0n) as bigint) : 0n

  // Parse chantiers terminés
  const completedChantiers: CompletedChantierRow[] = completedIds.flatMap((id, i) => {
    const raw = chantiersData?.[i]?.result as readonly unknown[] | undefined
    if (!raw) return []
    return [
      {
        id,
        name: raw[1] as string,
        devisAmount: raw[5] as bigint,
        platformFees: ((raw[5] as bigint) * 200n) / 10000n,
        completedAt: raw[13] as bigint,
      },
    ]
  })

  // Parse chantiers en litige — filtre status InLitige courant (4)
  const litigeChantiers: LitigeChantierRow[] = litigeIds.flatMap((id, i) => {
    const raw = litigeData?.[i]?.result as readonly unknown[] | undefined
    if (!raw) return []
    const status = Number(raw[8])
    if (status !== ChantierStatus.InLitige) return [] // litige déjà résolu
    return [
      {
        id,
        name: raw[1] as string,
        artisan: raw[2] as `0x${string}`,
        particulier: raw[3] as `0x${string}`,
        devisAmount: raw[5] as bigint,
        jalonIndex: litigeJalonMap.get(id) ?? 0,
      },
    ]
  })

  return {
    platformFeesTotal,
    yieldTotal,
    completedChantiers,
    litigeChantiers,
    isLoading: isLoadingIds || isLoadingStats || isLoadingChantiers || isLoadingLitige,
  }
}
