'use client'

import { wagmiAdapter, projectId } from '@/config'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createAppKit } from '@reown/appkit/react'
import { arbitrumSepolia } from '@reown/appkit/networks'
import React, { type ReactNode } from 'react'
import { cookieToInitialState, WagmiProvider, type Config } from 'wagmi'

const queryClient = new QueryClient()

if (!projectId) {
  throw new Error('Project ID is not defined — set NEXT_PUBLIC_PROJECT_ID in .env.local')
}

const metadata = {
  name: 'Trust BTP',
  description: 'Séquestre décentralisé pour chantiers BTP',
  url: 'https://trustbtp.app',
  icons: ['https://avatars.githubusercontent.com/u/179229932'],
}

createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [arbitrumSepolia],
  defaultNetwork: arbitrumSepolia,
  metadata,
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': 'oklch(0.82 0.15 175)',
  },
  features: {
    analytics: false,
  },
})

function ContextProvider({ children, cookies }: { children: ReactNode; cookies: string | null }) {
  const initialState = cookieToInitialState(wagmiAdapter.wagmiConfig as Config, cookies)

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig as Config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )
}

export default ContextProvider
