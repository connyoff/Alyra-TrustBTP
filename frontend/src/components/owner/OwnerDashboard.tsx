'use client'

import { useRouter } from 'next/navigation'
import { Loader2, ShieldCheck, ShieldOff, ExternalLink } from 'lucide-react'
import { useOwnerDashboard, LitigeChantierRow } from '@/hooks/useOwnerDashboard'
import { TokenURIModal } from './TokenURIModal'
import { formatToken, shortAddress } from '@/lib/utils'
import { Button } from '@/components/ui/button'

function StatCard({ label, value, alert }: { label: string; value: string; alert?: boolean }) {
  return (
    <div className={`rounded-xl border px-5 py-4 flex-1 min-w-0 bg-card ${alert ? 'border-red-500/40' : 'border-border/50'}`}>
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className={`text-2xl font-bold ${alert ? 'text-red-400' : 'text-[oklch(0.82_0.15_175)]'}`}>{value}</div>
    </div>
  )
}

function formatDate(ts: bigint): string {
  if (ts === 0n) return '—'
  return new Date(Number(ts) * 1000).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function OwnerDashboard() {
  const router = useRouter()
  const { platformFeesTotal, yieldTotal, completedChantiers, litigeChantiers, isLoading } =
    useOwnerDashboard()

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="flex items-center gap-2">
        <ShieldCheck className="size-5 text-[oklch(0.82_0.15_175)]" />
        <h2 className="text-xl font-bold tracking-tight">Administration</h2>
      </div>

      {/* Stats globales */}
      <div className="flex gap-3 flex-wrap">
        <StatCard
          label="Frais plateforme accumulés (USDC)"
          value={formatToken(platformFeesTotal)}
        />
        <StatCard
          label="Yield DeFi disponible (USDC)"
          value={formatToken(yieldTotal)}
        />
        <StatCard
          label="Chantiers terminés"
          value={completedChantiers.length.toString()}
        />
        <StatCard
          label="Litiges en attente"
          value={litigeChantiers.length.toString()}
          alert={litigeChantiers.length > 0}
        />
      </div>

      {/* ── Litiges en cours ── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <ShieldOff className="size-4 text-red-400" />
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Litiges en cours
          </h3>
          {litigeChantiers.length > 0 && (
            <span className="rounded-full bg-red-500/15 text-red-400 text-xs font-semibold px-2 py-0.5">
              {litigeChantiers.length}
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground py-10 justify-center">
            <Loader2 className="size-4 animate-spin" />
            Chargement…
          </div>
        ) : litigeChantiers.length === 0 ? (
          <div className="rounded-xl border border-border/50 bg-card py-10 text-center">
            <p className="text-muted-foreground text-sm">Aucun litige actif.</p>
          </div>
        ) : (
          <div className="rounded-xl border border-red-500/20 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-red-500/20 bg-red-500/5">
                  <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">ID</th>
                  <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Chantier</th>
                  <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Artisan</th>
                  <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Particulier</th>
                  <th className="text-right px-4 py-3 text-xs text-muted-foreground font-medium">Devis</th>
                  <th className="text-center px-4 py-3 text-xs text-muted-foreground font-medium">Jalon</th>
                  <th className="text-center px-4 py-3 text-xs text-muted-foreground font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {litigeChantiers.map((c: LitigeChantierRow, i: number) => (
                  <tr
                    key={c.id.toString()}
                    className={`border-b border-border/30 last:border-0 ${i % 2 === 0 ? '' : 'bg-muted/10'}`}
                  >
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                      #{c.id.toString()}
                    </td>
                    <td className="px-4 py-3 font-medium max-w-[160px]">
                      <span title={c.name || `Chantier #${c.id}`}>
                        {(() => {
                          const n = c.name || `Chantier #${c.id}`
                          return n.length > 20 ? n.slice(0, 20) + '…' : n
                        })()}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {shortAddress(c.artisan)}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {shortAddress(c.particulier)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {formatToken(c.devisAmount)}
                    </td>
                    <td className="px-4 py-3 text-center text-muted-foreground text-xs">
                      Jalon {c.jalonIndex + 1}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Button
                        size="sm"
                        variant="destructive"
                        className="gap-1.5"
                        onClick={() => router.push(`/chantier/${c.id}`)}
                      >
                        <ExternalLink className="size-3" />
                        Résoudre
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Chantiers terminés ── */}
      <div>
        <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
          Chantiers terminés
        </h3>

        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground py-10 justify-center">
            <Loader2 className="size-4 animate-spin" />
            Chargement…
          </div>
        ) : completedChantiers.length === 0 ? (
          <div className="rounded-xl border border-border/50 bg-card py-12 text-center">
            <p className="text-muted-foreground text-sm">Aucun chantier terminé pour le moment.</p>
          </div>
        ) : (
          <div className="rounded-xl border border-border/50 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-muted/30">
                  <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">ID</th>
                  <th className="text-left px-4 py-3 text-xs text-muted-foreground font-medium">Chantier</th>
                  <th className="text-right px-4 py-3 text-xs text-muted-foreground font-medium">Devis</th>
                  <th className="text-right px-4 py-3 text-xs text-muted-foreground font-medium">Frais (2%)</th>
                  <th className="text-center px-4 py-3 text-xs text-muted-foreground font-medium">Terminé le</th>
                  <th className="text-center px-4 py-3 text-xs text-muted-foreground font-medium">NFT</th>
                </tr>
              </thead>
              <tbody>
                {completedChantiers.map((c, i) => (
                  <tr
                    key={c.id.toString()}
                    className={`border-b border-border/30 last:border-0 ${i % 2 === 0 ? '' : 'bg-muted/10'}`}
                  >
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                      #{c.id.toString()}
                    </td>
                    <td className="px-4 py-3 font-medium max-w-[180px] truncate">
                      {c.name || '—'}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {formatToken(c.devisAmount)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-[oklch(0.82_0.15_175)]">
                      {formatToken(c.platformFees)}
                    </td>
                    <td className="px-4 py-3 text-center text-muted-foreground text-xs">
                      {formatDate(c.completedAt)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <TokenURIModal chantierId={c.id} chantierName={c.name} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
