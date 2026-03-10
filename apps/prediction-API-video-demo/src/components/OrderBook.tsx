"use client";

import { useAutoRefresh } from "@/lib/hooks";
import { getOrderBook } from "@/lib/jupiter";
import { useCallback } from "react";

interface OrderBookProps {
  marketId: string;
}

// API returns: { yes: [[price_cents, size], ...], no: [[price_cents, size], ...] }
export default function OrderBook({ marketId }: OrderBookProps) {
  const fetcher = useCallback(() => getOrderBook(marketId), [marketId]);
  const { data, loading } = useAutoRefresh(fetcher);

  // data is the response directly (no .data wrapper)
  const yesBids = data?.yes || [];
  const noAsks = data?.no || [];

  const maxYesSize = Math.max(...yesBids.map((e: any) => Number(e[1] || 0)), 1);
  const maxNoSize = Math.max(...noAsks.map((e: any) => Number(e[1] || 0)), 1);

  if (loading && yesBids.length === 0) {
    return (
      <div className="rounded-xl border border-jupiter-border bg-jupiter-card p-4">
        <h3 className="text-sm font-semibold text-jupiter-text mb-3">Order Book</h3>
        <div className="animate-pulse space-y-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-5 rounded bg-jupiter-border/50" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-jupiter-border bg-jupiter-card p-4">
      <h3 className="text-sm font-semibold text-jupiter-text mb-3">Order Book</h3>

      <div className="grid grid-cols-2 gap-4 text-[11px]">
        {/* Yes side (Bids) */}
        <div>
          <div className="flex justify-between text-jupiter-muted mb-1.5 px-1 font-medium">
            <span>Price (Yes)</span>
            <span>Size</span>
          </div>
          <div className="space-y-0.5">
            {yesBids.length === 0 && (
              <div className="text-center text-jupiter-muted py-4">No bids</div>
            )}
            {yesBids.slice(0, 15).map((entry: [number, number], i: number) => {
              const [priceCents, size] = entry;
              return (
                <div key={i} className="relative flex justify-between px-1 py-0.5 rounded">
                  <div
                    className="absolute inset-y-0 left-0 rounded bg-jupiter-green/10"
                    style={{ width: `${(size / maxYesSize) * 100}%` }}
                  />
                  <span className="relative text-jupiter-green font-mono">
                    {priceCents}¢
                  </span>
                  <span className="relative text-jupiter-text font-mono">
                    {size.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* No side (Asks) */}
        <div>
          <div className="flex justify-between text-jupiter-muted mb-1.5 px-1 font-medium">
            <span>Price (No)</span>
            <span>Size</span>
          </div>
          <div className="space-y-0.5">
            {noAsks.length === 0 && (
              <div className="text-center text-jupiter-muted py-4">No asks</div>
            )}
            {noAsks.slice(0, 15).map((entry: [number, number], i: number) => {
              const [priceCents, size] = entry;
              return (
                <div key={i} className="relative flex justify-between px-1 py-0.5 rounded">
                  <div
                    className="absolute inset-y-0 right-0 rounded bg-jupiter-red/10"
                    style={{ width: `${(size / maxNoSize) * 100}%` }}
                  />
                  <span className="relative text-jupiter-red font-mono">
                    {priceCents}¢
                  </span>
                  <span className="relative text-jupiter-text font-mono">
                    {size.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
