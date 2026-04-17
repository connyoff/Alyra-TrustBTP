import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import Layout from '@/components/shared/Layout'
import { headers } from 'next/headers'
import ContextProvider from '@/context'
import { cn } from '@/lib/utils'

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'Trust BTP — Séquestre décentralisé',
  description: 'Paiements par jalons, yield DeFi, réputation on-chain. Pour les chantiers BTP.',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headersObj = await headers()
  const cookies = headersObj.get('cookie')

  return (
    <html lang="fr" className={cn('font-sans dark', geist.variable)}>
      <body suppressHydrationWarning>
        <ContextProvider cookies={cookies}>
          <Layout>{children}</Layout>
        </ContextProvider>
      </body>
    </html>
  )
}
