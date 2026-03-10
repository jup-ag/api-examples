"use client";

import { useCallback } from "react";
import { getLeaderboard } from "@/lib/jupiter";
import { useAutoRefresh } from "@/lib/hooks";
import Spinner from "@/components/Spinner";
import { formatVolume, shortenAddress, cn, getPnlColor, getPnlSign, microToUsd } from "@/lib/utils";

export default function LeaderboardPage() {
  const fetcher = useCallback(() => getLeaderboard(), []);
  const { data, loading } = useAutoRefresh(fetcher);
  const entries = data?.data || [];

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2">Leaderboard</h1>
      <p className="text-sm text-jupiter-muted mb-6">
        Top traders ranked by performance.
      </p>

      {loading && entries.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      )}

      {!loading && entries.length === 0 && (
        <div className="rounded-xl border border-jupiter-border bg-jupiter-card p-12 text-center">
          <p className="text-jupiter-muted">Leaderboard data not available yet.</p>
        </div>
      )}

      {entries.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-jupiter-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-jupiter-border bg-jupiter-card">
                <th className="px-4 py-3 text-left text-xs font-medium text-jupiter-muted">Rank</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-jupiter-muted">Trader</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-jupiter-muted">PnL</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-jupiter-muted">Volume</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-jupiter-muted">Predictions</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-jupiter-muted">Win Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-jupiter-border">
              {entries.map((entry: any, i: number) => {
                const rank = i + 1;
                const pnl = microToUsd(entry.realizedPnlUsd || 0);
                return (
                  <tr key={entry.ownerPubkey || i} className="bg-jupiter-bg hover:bg-jupiter-hover transition-colors">
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold",
                          rank === 1
                            ? "bg-yellow-500/20 text-yellow-400"
                            : rank === 2
                            ? "bg-gray-400/20 text-gray-300"
                            : rank === 3
                            ? "bg-amber-600/20 text-amber-500"
                            : "bg-jupiter-border text-jupiter-muted"
                        )}
                      >
                        {rank}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-jupiter-text">
                        {shortenAddress(entry.ownerPubkey || "", 6)}
                      </span>
                    </td>
                    <td className={cn("px-4 py-3 text-right font-mono font-semibold", getPnlColor(pnl))}>
                      {getPnlSign(pnl)}${Math.abs(pnl).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-jupiter-text">
                      {entry.totalVolumeUsd ? formatVolume(entry.totalVolumeUsd) : "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-jupiter-text">
                      {entry.predictionsCount ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-jupiter-text">
                      {entry.winRatePct ? `${Number(entry.winRatePct).toFixed(1)}%` : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {entries.length > 0 && (
        <div className="mt-4 text-center text-[11px] text-jupiter-muted/50">
          Auto-refreshes every 30 seconds
        </div>
      )}
    </div>
  );
}
