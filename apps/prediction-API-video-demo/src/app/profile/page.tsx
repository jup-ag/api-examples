"use client";

import { useCallback, useMemo } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { getPositions, getHistory } from "@/lib/jupiter";
import { useAutoRefresh } from "@/lib/hooks";
import PnLChart from "@/components/PnLChart";
import Spinner from "@/components/Spinner";
import { microToUsd, shortenAddress, cn, getPnlColor, getPnlSign } from "@/lib/utils";

export default function ProfilePage() {
  const { publicKey } = useWallet();
  const walletAddress = publicKey?.toBase58();

  const positionsFetcher = useCallback(async () => {
    if (!walletAddress) return { data: [] };
    return getPositions(walletAddress);
  }, [walletAddress]);

  const historyFetcher = useCallback(async () => {
    if (!walletAddress) return { data: [] };
    return getHistory(walletAddress);
  }, [walletAddress]);

  const { data: posData, loading: posLoading } = useAutoRefresh(positionsFetcher);
  const { data: histData, loading: histLoading } = useAutoRefresh(historyFetcher);

  const positions = posData?.data || [];
  const history = histData?.data || [];

  const stats = useMemo(() => {
    const totalPnl = positions.reduce(
      (sum: number, p: any) => sum + microToUsd(p.pnlUsd || 0),
      0
    );
    const totalValue = positions.reduce(
      (sum: number, p: any) => sum + microToUsd(p.valueUsd || 0),
      0
    );
    const totalCost = positions.reduce(
      (sum: number, p: any) => sum + microToUsd(p.totalCostUsd || 0),
      0
    );
    const totalTrades = history.length;

    // Calculate win rate from history entries that have realized PnL
    const tradesWithPnl = history.filter((t: any) => Number(t.realizedPnl || 0) !== 0);
    const wins = tradesWithPnl.filter((t: any) => Number(t.realizedPnl || 0) > 0).length;
    const winRate = tradesWithPnl.length > 0 ? wins / tradesWithPnl.length : 0;

    return { totalPnl, totalValue, totalCost, totalTrades, winRate };
  }, [positions, history]);

  // Build cumulative PnL chart from history
  const chartData = useMemo(() => {
    if (history.length === 0) return [];

    let cumPnl = 0;
    return history
      .slice()
      .sort((a: any, b: any) => (a.timestamp || 0) - (b.timestamp || 0))
      .filter((t: any) => Number(t.realizedPnl || 0) !== 0)
      .map((trade: any) => {
        cumPnl += microToUsd(trade.realizedPnl || 0);
        return {
          date: new Date((trade.timestamp || 0) * 1000).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          pnl: Number(cumPnl.toFixed(2)),
        };
      });
  }, [history]);

  if (!publicKey) {
    return (
      <div className="rounded-xl border border-jupiter-border bg-jupiter-card p-12 text-center">
        <h2 className="text-lg font-bold text-white mb-2">Your Profile</h2>
        <p className="text-sm text-jupiter-muted">Connect your wallet to view your profile.</p>
      </div>
    );
  }

  const loading = posLoading || histLoading;

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2">Profile</h1>
      <div className="mb-6 flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-jupiter-accent to-jupiter-green" />
        <span className="font-mono text-sm text-jupiter-muted">
          {shortenAddress(walletAddress || "", 8)}
        </span>
      </div>

      {loading && positions.length === 0 && history.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      )}

      {/* Stats grid */}
      <div className="mb-6 grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="rounded-xl border border-jupiter-border bg-jupiter-card p-4">
          <div className="text-xs text-jupiter-muted">Portfolio Value</div>
          <div className="mt-1 text-lg font-bold text-white">${stats.totalValue.toFixed(2)}</div>
        </div>
        <div className="rounded-xl border border-jupiter-border bg-jupiter-card p-4">
          <div className="text-xs text-jupiter-muted">Total Cost</div>
          <div className="mt-1 text-lg font-bold text-jupiter-text">${stats.totalCost.toFixed(2)}</div>
        </div>
        <div className="rounded-xl border border-jupiter-border bg-jupiter-card p-4">
          <div className="text-xs text-jupiter-muted">Unrealized PnL</div>
          <div className={`mt-1 text-lg font-bold ${getPnlColor(stats.totalPnl)}`}>
            {getPnlSign(stats.totalPnl)}${Math.abs(stats.totalPnl).toFixed(2)}
          </div>
        </div>
        <div className="rounded-xl border border-jupiter-border bg-jupiter-card p-4">
          <div className="text-xs text-jupiter-muted">Total Trades</div>
          <div className="mt-1 text-lg font-bold text-white">{stats.totalTrades}</div>
        </div>
        <div className="rounded-xl border border-jupiter-border bg-jupiter-card p-4">
          <div className="text-xs text-jupiter-muted">Win Rate</div>
          <div className="mt-1 text-lg font-bold text-jupiter-accent">
            {(stats.winRate * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      {/* PnL Chart */}
      <PnLChart data={chartData} />

      {/* Open positions summary */}
      {positions.length > 0 && (
        <div className="mt-6">
          <h3 className="mb-3 text-sm font-semibold text-jupiter-text">Open Positions ({positions.length})</h3>
          <div className="space-y-2">
            {positions.slice(0, 5).map((pos: any) => {
              const pnl = microToUsd(pos.pnlUsd || 0);
              const side = pos.isYes ? "yes" : "no";
              return (
                <div
                  key={pos.pubkey}
                  className="flex items-center justify-between rounded-lg border border-jupiter-border bg-jupiter-card p-3"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                        side === "yes"
                          ? "bg-jupiter-green/20 text-jupiter-green"
                          : "bg-jupiter-red/20 text-jupiter-red"
                      )}
                    >
                      {side}
                    </span>
                    <span className="text-sm text-jupiter-text truncate">
                      {pos.marketMetadata?.title || pos.eventMetadata?.title || pos.marketId}
                    </span>
                  </div>
                  <span className={cn("font-mono text-sm font-semibold ml-2", getPnlColor(pnl))}>
                    {getPnlSign(pnl)}${Math.abs(pnl).toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-6 text-center text-[11px] text-jupiter-muted/50">
        Auto-refreshes every 30 seconds
      </div>
    </div>
  );
}
