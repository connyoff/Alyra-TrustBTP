import { useTrustScore } from '@/hooks/useTrustScore'
import { TrustTier, TRUST_TIER_LABEL } from '@/types/contracts'
import { cn } from '@/lib/utils'
import { Star } from 'lucide-react'

const TIER_COLORS: Record<TrustTier, string> = {
  [TrustTier.Nouveau]: 'text-zinc-400 border-zinc-500/30 bg-zinc-500/10',
  [TrustTier.Confirme]: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
  [TrustTier.Expert]: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
  [TrustTier.Elite]: 'text-teal-400 border-teal-500/30 bg-teal-500/10',
}

interface TrustScoreBadgeProps {
  artisanAddress: `0x${string}` | undefined
  compact?: boolean
}

export function TrustScoreBadge({ artisanAddress, compact = false }: TrustScoreBadgeProps) {
  const { stats, isLoading } = useTrustScore(artisanAddress)

  if (isLoading || !stats) {
    return <span className="text-xs text-muted-foreground">—</span>
  }

  const tierClass = TIER_COLORS[stats.tier]

  if (compact) {
    return (
      <span className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium', tierClass)}>
        <Star className="size-3" />
        {Number(stats.score)}/100
      </span>
    )
  }

  return (
    <div className={cn('inline-flex items-center gap-2 rounded-lg border px-3 py-1.5', tierClass)}>
      <Star className="size-4" />
      <div>
        <div className="text-sm font-semibold">{TRUST_TIER_LABEL[stats.tier]}</div>
        <div className="text-xs opacity-70">{Number(stats.score)}/100 · {Number(stats.chantiersCompleted)} chantiers</div>
      </div>
    </div>
  )
}
