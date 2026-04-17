'use client'

import { useAccount } from 'wagmi'
import { Dashboard } from '@/components/chantier/Dashboard'
import { OwnerDashboard } from '@/components/owner/OwnerDashboard'
import NotConnected from '@/components/shared/NotConnected'
import { useIsOwner } from '@/hooks/useIsOwner'

export default function Home() {
  const { isConnected } = useAccount()
  const { isOwner, isLoading: isOwnerLoading } = useIsOwner()

  if (!isConnected) return <NotConnected />

  return (
    <div className="relative min-h-screen">
      {/* Grille de fond */}
      <div className="fixed inset-0 grid-bg pointer-events-none" />
      {/* Lueur teal en haut à gauche */}
      <div className="fixed top-0 left-0 w-[600px] h-[400px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 20% 20%, oklch(0.82 0.15 175 / 6%) 0%, transparent 60%)' }}
      />
      {/* Lueur violet subtile en bas à droite */}
      <div className="fixed bottom-0 right-0 w-[500px] h-[350px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 80% 80%, oklch(0.60 0.18 290 / 8%) 0%, transparent 70%)' }}
      />
      <div className="relative container max-w-5xl mx-auto px-4 py-8">
        {isOwnerLoading ? null : isOwner ? <OwnerDashboard /> : <Dashboard />}
      </div>
    </div>
  )
}
