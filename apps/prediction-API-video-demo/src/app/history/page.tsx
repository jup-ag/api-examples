"use client";

import { useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { getHistory } from "@/lib/jupiter";
import { useAutoRefresh } from "@/lib/hooks";
import Spinner from "@/components/Spinner";
import { microToUsd, microToCents, cn, shortenAddress, getPnlColor, getPnlSign } from "@/lib/utils";

function formatTimestamp(ts: number): string {
  return new Date(ts * 1000).toLocaleString("en-US", {
    month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
  });
}

function eventTypeLabel(type: string): string {
  switch (type) {
    case "order_filled": return "Filled";
    case "order_placed": return "Placed";
    case "order_cancelled": return "Cancelled";
    case "payout_claimed": return "Claimed";
    case "position_closed": return "Closed";
    default: return type?.replace(/_/g, " ") || "—";
  }
}

function eventTypeColor(type: string): string {
  switch (type) {
    case "order_filled": return "text-jupiter-green";
    case "payout_claimed": return "text-jupiter-accent";
    case "order_cancelled": return "text-jupiter-red";
    case "position_closed": return "text-orange-400";
    default: return "text-jupiter-muted";
  }
}

export default function HistoryPage() {
  const { publicKey } = useWallet();
  const walletAddress = publicKey?.toBase58();

  const fetcher = useCallback(async () => {
    if (!walletAddress) return { data: [] };
    return getHistory(walletAddress);
  }, [walletAddress]);

  const { data, loading } = useAutoRefresh(fetcher);
  const trades = data?.data || [];

  if (!publicKey) {
    return (
      <div className="rounded-xl border border-jupiter-border bg-jupiter-card p-12 text-center">
        <h2 className="text-lg font-bold text-white mb-2">Trade History</h2>
        <p className="text-sm text-jupiter-muted">Connect your wallet to view trade history.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2">Trade History</h1>
      <p className="text-sm text-jupiter-muted mb-6">All your past prediction market trades.</p>

      {loading && trades.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" />
        </div>
      )}

      {!loading && trades.length === 0 && (
        <div className="rounded-xl border border-jupiter-border bg-jupiter-card p-12 text-center">
          <p className="text-jupiter-muted">No trades yet.</p>
        </div>
      )}

      {trades.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-jupiter-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-jupiter-border bg-jupiter-card">
                <th className="px-4 py-3 text-left text-xs font-medium text-jupiter-muted">Market</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-jupiter-muted">Side</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-jupiter-muted">Type</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-jupiter-muted">Contracts</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-jupiter-muted">Cost</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-jupiter-muted">PnL</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-jupiter-muted">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-jupiter-border">
              {trades.map((trade: any, i: number) => {
                const side = trade.isYes ? "yes" : "no";
                const pnl = microToUsd(trade.realizedPnl || 0);
                const title = trade.marketMetadata?.title || trade.eventMetadata?.title || shortenAddress(trade.marketId || "");
                const eventTitle = trade.eventMetadata?.title;
                const contracts = Number(trade.filledContracts || trade.contracts || trade.contractsSettled || 0);

                return (
                  <tr key={trade.id || trade.signature || i} className="bg-jupiter-bg hover:bg-jupiter-hover transition-colors">
                    <td className="px-4 py-3">
                      <div className="max-w-[200px]">
                        <div className="truncate font-medium text-jupiter-text">{title}</div>
                        {eventTitle && eventTitle !== title && (
                          <div className="truncate text-[11px] text-jupiter-muted">{eventTitle}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
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
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("text-xs font-medium capitalize", eventTypeColor(trade.eventType))}>
                        {eventTypeLabel(trade.eventType)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-jupiter-text">
                      {contracts > 0 ? contracts.toLocaleString() : "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-jupiter-text">
                      {trade.totalCostUsd && Number(trade.totalCostUsd) > 0
                        ? `$${microToUsd(trade.totalCostUsd).toFixed(2)}`
                        : trade.payoutAmountUsd && Number(trade.payoutAmountUsd) > 0
                        ? `$${microToUsd(trade.payoutAmountUsd).toFixed(2)}`
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {pnl !== 0 ? (
                        <span className={cn("font-mono font-semibold", getPnlColor(pnl))}>
                          {getPnlSign(pnl)}${Math.abs(pnl).toFixed(2)}
                        </span>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-jupiter-muted whitespace-nowrap">
                      {trade.timestamp ? formatTimestamp(trade.timestamp) : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {trades.length > 0 && (
        <div className="mt-4 text-center text-[11px] text-jupiter-muted/50">
          Auto-refreshes every 30 seconds
        </div>
      )}
    </div>
  );
}
