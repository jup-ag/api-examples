"use client";

import { useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { getPositions } from "@/lib/jupiter";
import { useAutoRefresh } from "@/lib/hooks";
import PositionCard from "@/components/PositionCard";
import Spinner from "@/components/Spinner";
import { microToUsd, getPnlColor, getPnlSign } from "@/lib/utils";

export default function PositionsPage() {
  const { publicKey } = useWallet();
  const walletAddress = publicKey?.toBase58();

  const fetcher = useCallback(async () => {
    if (!walletAddress) return { data: [] };
    return getPositions(walletAddress);
  }, [walletAddress]);

  const { data, loading, refresh } = useAutoRefresh(fetcher);
  const positions = data?.data || [];

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

  if (!publicKey) {
    return (
      <div className="rounded-xl border border-jupiter-border bg-jupiter-card p-12 text-center">
        <h2 className="text-lg font-bold text-white mb-2">Your Positions</h2>
        <p className="text-sm text-jupiter-muted">Connect your wallet to view positions.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2">Your Positions</h1>
      <p className="text-sm text-jupiter-muted mb-6">Live PnL tracking across all your markets.</p>

      {/* Portfolio summary */}
      <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-jupiter-border bg-jupiter-card p-4">
          <div className="text-xs text-jupiter-muted">Total Value</div>
          <div className="mt-1 text-lg font-bold text-white">${totalValue.toFixed(2)}</div>
        </div>
        <div className="rounded-xl border border-jupiter-border bg-jupiter-card p-4">
          <div className="text-xs text-jupiter-muted">Total Cost</div>
          <div className="mt-1 text-lg font-bold text-jupiter-text">${totalCost.toFixed(2)}</div>
        </div>
        <div className="rounded-xl border border-jupiter-border bg-jupiter-card p-4">
          <div className="text-xs text-jupiter-muted">Unrealized PnL</div>
          <div className={`mt-1 text-lg font-bold ${getPnlColor(totalPnl)}`}>
            {getPnlSign(totalPnl)}${Math.abs(totalPnl).toFixed(2)}
          </div>
        </div>
        <div className="rounded-xl border border-jupiter-border bg-jupiter-card p-4">
          <div className="text-xs text-jupiter-muted">Open Positions</div>
          <div className="mt-1 text-lg font-bold text-white">{positions.length}</div>
        </div>
      </div>

      {loading && positions.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      )}

      {!loading && positions.length === 0 && (
        <div className="rounded-xl border border-jupiter-border bg-jupiter-card p-12 text-center">
          <p className="text-jupiter-muted">No open positions yet.</p>
          <p className="mt-1 text-xs text-jupiter-muted/70">
            Browse markets and place your first bet.
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {positions.map((pos: any) => (
          <PositionCard key={pos.pubkey} position={pos} onAction={refresh} />
        ))}
      </div>

      {positions.length > 0 && (
        <div className="mt-4 text-center text-[11px] text-jupiter-muted/50">
          Auto-refreshes every 30 seconds
        </div>
      )}
    </div>
  );
}
