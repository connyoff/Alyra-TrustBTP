'use client'

import { useEffect, useState } from 'react'
import { useSignTypedData, useWriteContract, useWaitForTransactionReceipt, useReadContracts, useReadContract, useChainId } from 'wagmi'
import { ESCROW_VAULT_ADDRESS, ESCROW_VAULT_ABI, TOKEN_ADDRESS, ERC20_PERMIT_ABI, ERC20_ABI } from '@/lib/contracts'

// Deadline : 20 minutes dans le futur (standard DeFi)
const PERMIT_DEADLINE_SEC = 20 * 60

// Circle USDC testnet Arbitrum Sepolia — domaine EIP-712 connu
const CIRCLE_USDC_ADDRESSES = new Set([
  '0x75faf114eafb1bdbe2f0316df893fd58ce46aa4d',
].map(a => a.toLowerCase()))

function resolveTokenVersion(rawVersion: string | undefined, tokenAddress: `0x${string}`): string {
  // Circle USDC utilise "2" dans son domaine EIP-712 même si version() n'est pas exposée publiquement
  if (CIRCLE_USDC_ADDRESSES.has(tokenAddress.toLowerCase())) return '2'
  return rawVersion ?? '1'
}

/**
 * Hook EIP-2612 — signe le permit off-chain puis envoie acceptDevisWithPermit en 1 transaction.
 *
 * Flux :
 *   1. sign()  → useSignTypedData génère la signature EIP-712 (popup MetaMask, pas de gas)
 *   2. accept(yieldOptIn) → useWriteContract envoie acceptDevisWithPermit avec la signature
 */
export function useAcceptDevis(
  chantierId: bigint,
  depositAmount: bigint,
  walletAddress: `0x${string}` | undefined,
  onSuccess?: () => void
) {
  const chainId = useChainId()
  const [step, setStep] = useState<'idle' | 'signing' | 'sending' | 'done'>('idle')
  const [permitSig, setPermitSig] = useState<{ v: number; r: `0x${string}`; s: `0x${string}`; deadline: bigint } | null>(null)

  // Lecture du nonce et du nom du token (domaine EIP-712)
  const { data: permitData } = useReadContracts({
    contracts: [
      { address: TOKEN_ADDRESS, abi: ERC20_PERMIT_ABI, functionName: 'nonces', args: [walletAddress ?? '0x0'] },
      { address: TOKEN_ADDRESS, abi: ERC20_PERMIT_ABI, functionName: 'name' },
      { address: TOKEN_ADDRESS, abi: ERC20_PERMIT_ABI, functionName: 'version' },
    ],
    query: { enabled: !!walletAddress },
  })

  const nonce = permitData?.[0]?.result as bigint | undefined
  const tokenName = permitData?.[1]?.result as string | undefined
  // Version du domaine EIP-712 : Circle USDC = "2", mock OZ v5 = "1"
  const tokenVersion = resolveTokenVersion(permitData?.[2]?.result as string | undefined, TOKEN_ADDRESS)

  // Lecture de l'allowance courante — pour le fallback approve+deposit
  const { data: currentAllowance } = useReadContract({
    address: TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: walletAddress ? [walletAddress, ESCROW_VAULT_ADDRESS] : undefined,
    query: { enabled: !!walletAddress },
  })
  const hasEnoughAllowance = (currentAllowance as bigint | undefined) !== undefined
    && (currentAllowance as bigint) >= depositAmount

  const { signTypedData, isPending: isSigning, error: signError } = useSignTypedData()
  const { writeContract, data: txHash, isPending: isSending, error: writeError } = useWriteContract()

  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
  })

  // Étape 1 : signer le permit EIP-712 (off-chain, sans gas)
  function sign() {
    if (!walletAddress || nonce === undefined || !tokenName) return
    setStep('signing')

    const deadline = BigInt(Math.floor(Date.now() / 1000) + PERMIT_DEADLINE_SEC)

    signTypedData(
      {
        domain: {
          name: tokenName,
          version: tokenVersion,
          chainId,
          verifyingContract: TOKEN_ADDRESS,
        },
        types: {
          Permit: [
            { name: 'owner',    type: 'address' },
            { name: 'spender',  type: 'address' },
            { name: 'value',    type: 'uint256' },
            { name: 'nonce',    type: 'uint256' },
            { name: 'deadline', type: 'uint256' },
          ],
        },
        primaryType: 'Permit',
        message: {
          owner: walletAddress,
          spender: ESCROW_VAULT_ADDRESS,
          value: depositAmount,
          nonce,
          deadline,
        },
      },
      {
        onSuccess(sig) {
          // Décomposer la signature compacte en v, r, s
          const r = sig.slice(0, 66) as `0x${string}`
          const s = `0x${sig.slice(66, 130)}` as `0x${string}`
          const v = parseInt(sig.slice(130, 132), 16)
          setPermitSig({ v, r, s, deadline })
          setStep('idle')
        },
        onError() {
          setStep('idle')
        },
      }
    )
  }

  // Étape 2 : envoyer la transaction acceptDevisWithPermit (1 transaction)
  function accept(yieldOptIn: boolean) {
    if (!permitSig) {
      // Fallback : pas de signature mais allowance suffisante → on peut quand même déposer
      // en envoyant des v/r/s bidon (le try/catch du contrat les absorbe, safeTransferFrom fait le boulot)
      if (hasEnoughAllowance) {
        const dummyDeadline = BigInt(Math.floor(Date.now() / 1000) + PERMIT_DEADLINE_SEC)
        setStep('sending')
        writeContract({
          address: ESCROW_VAULT_ADDRESS,
          abi: ESCROW_VAULT_ABI,
          functionName: 'acceptDevisWithPermit',
          args: [chantierId, yieldOptIn, dummyDeadline, 0, '0x0000000000000000000000000000000000000000000000000000000000000000', '0x0000000000000000000000000000000000000000000000000000000000000000'],
        })
      }
      return
    }
    setStep('sending')
    writeContract({
      address: ESCROW_VAULT_ADDRESS,
      abi: ESCROW_VAULT_ABI,
      functionName: 'acceptDevisWithPermit',
      args: [chantierId, yieldOptIn, permitSig.deadline, permitSig.v, permitSig.r, permitSig.s],
    })
  }

  // Fallback : approve classique en 1 tx (alternative au permit)
  function approve() {
    setStep('sending')
    writeContract({
      address: TOKEN_ADDRESS,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [ESCROW_VAULT_ADDRESS, depositAmount],
    })
  }

  useEffect(() => {
    if (!isConfirmed || step !== 'sending') return
    // Planifier les mises à jour d'état après le cycle de rendu courant
    const id = setTimeout(() => {
      setStep('done')
      setPermitSig(null)
      onSuccess?.()
    }, 0)
    return () => clearTimeout(id)
  }, [isConfirmed, step, onSuccess])

  return {
    sign,
    accept,
    approve,
    isSigned: !!permitSig,
    hasEnoughAllowance,
    step,
    isPending: isSigning || isSending || isConfirming,
    isSuccess: isConfirmed,
    error: signError ?? writeError,
    txHash,
  }
}
