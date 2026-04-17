'use client'

import { useState, useEffect } from 'react'
import { parseAbiItem } from 'viem'
import { publicClient } from '@/lib/client'
import { ESCROW_VAULT_ADDRESS } from '@/lib/contracts'

// Charge les IDs de chantiers liés à une adresse (en tant qu'artisan ou particulier)
// via les événements DevisSoumis
export function useChantiersByAddress(address: `0x${string}` | undefined) {
  const [chantierIds, setChantierIds] = useState<bigint[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isArtisan, setIsArtisan] = useState(false)
  const [isParticulier, setIsParticulier] = useState(false)

  useEffect(() => {
    if (!address) {
      setChantierIds([])
      return
    }

    const load = async () => {
      setIsLoading(true)
      try {
        // Arbitrum Sepolia ≈ 250ms/bloc → 10 000 blocs ≈ 42 min de fenêtre        
        const latestBlock = await publicClient.getBlockNumber()
        const fromBlock = latestBlock > 10_000n ? latestBlock - 10_000n : 0n

        const event = parseAbiItem(
          'event DevisSoumis(uint256 indexed chantierId, address indexed artisan, address indexed particulier, address token, uint256 devisAmount)'
        )

        // Chantiers où l'adresse est artisan
        const asArtisan = await publicClient.getLogs({
          address: ESCROW_VAULT_ADDRESS,
          event,
          args: { artisan: address },
          fromBlock,
          toBlock: latestBlock,
        })

        // Chantiers où l'adresse est particulier
        const asParticulier = await publicClient.getLogs({
          address: ESCROW_VAULT_ADDRESS,
          event,
          args: { particulier: address },
          fromBlock,
          toBlock: latestBlock,
        })

        const ids = new Set<bigint>()
        for (const log of [...asArtisan, ...asParticulier]) {
          if (log.args.chantierId !== undefined) ids.add(log.args.chantierId)
        }

        // Tri décroissant (plus récent en premier)
        setChantierIds([...ids].sort((a, b) => (b > a ? 1 : -1)))
        setIsArtisan(asArtisan.length > 0)
        setIsParticulier(asParticulier.length > 0)
      } catch (e) {
        console.error('Erreur chargement chantiers:', e)
        setChantierIds([])
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [address])

  return { chantierIds, isLoading, isArtisan, isParticulier }
}
