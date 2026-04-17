import { createPublicClient, http } from 'viem'
import { arbitrumSepolia } from 'viem/chains'

// Réseau actif selon la variable d'environnement (défaut : hardhat local)
//const isTestnet = process.env.NEXT_PUBLIC_NETWORK === 'arbitrumSepolia'

const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL ?? 'https://sepolia-rollup.arbitrum.io/rpc'

export const publicClient = createPublicClient({
  chain: arbitrumSepolia,
  transport: http(rpcUrl, { timeout: 50_000 }),
})

// Bloc de départ pour les getLogs — évite de scanner depuis le bloc 0.
// À mettre à jour dans .env.local après chaque déploiement :
//   NEXT_PUBLIC_DEPLOY_BLOCK=<numéro du bloc du premier déploiement>
export const DEPLOY_FROM_BLOCK = BigInt(259967490);
