"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn, formatNumber } from "@/lib/utils";
import type { Market } from "@/lib/api";

export function MarketsTable({
  markets,
  selectedMarketId,
  eventId,
}: {
  markets: Market[];
  selectedMarketId?: string;
  eventId?: string;
}) {
  if (markets.length === 0) return null;

  // Sort: open markets by chance desc, then resolved markets at the bottom
  const sorted = [...markets].sort((a, b) => {
    const aResolved = a.status === "closed" && a.result != null;
    const bResolved = b.status === "closed" && b.result != null;
    if (aResolved !== bResolved) return aResolved ? 1 : -1;
    const aChance = (a.pricing.buyYesPriceUsd ?? 0) / 1_000_000;
    const bChance = (b.pricing.buyYesPriceUsd ?? 0) / 1_000_000;
    return bChance - aChance;
  });

  const eventParam = eventId ? `?event=${eventId}` : "";

  return (
    <div className="space-y-1">
      <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-4 px-3 pb-1 text-[11px] font-medium text-muted-foreground">
        <span />
        <span className="text-center">Chance</span>
        <span className="text-center">Yes</span>
        <span className="text-center">No</span>
      </div>
      {sorted.map((m) => {
        const isResolved = m.status === "closed" && m.result != null;
        const yesPrice = (m.pricing.buyYesPriceUsd ?? 0) / 1_000_000;
        const noPrice = (m.pricing.buyNoPriceUsd ?? 0) / 1_000_000;
        const chance = Math.round(yesPrice * 100);
        const yesCents = (yesPrice * 100).toFixed(1);
        const noCents = (noPrice * 100).toFixed(1);
        const isSelected = m.marketId === selectedMarketId;

        return (
          <Link
            key={m.marketId}
            href={`/market/${m.marketId}${eventParam}`}
            className={cn(
              "grid items-center gap-x-4 rounded-lg border px-3 py-3 transition-colors hover:bg-muted/50",
              isSelected && "border-primary bg-muted/30",
              isResolved
                ? "grid-cols-[1fr_auto] opacity-70"
                : "grid-cols-[1fr_auto_auto_auto]"
            )}
          >
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{m.metadata.title}</p>
              <p className="text-[11px] text-muted-foreground">
                ${formatNumber(m.pricing.volume)} vol
                {m.pricing.liquidityDollars != null && (
                  <> &middot; ${formatNumber(m.pricing.liquidityDollars / 1_000_000)} liq</>
                )}
              </p>
            </div>

            {isResolved ? (
              <span className="text-sm font-semibold capitalize text-muted-foreground">
                {m.result === "yes" ? "Yes" : "No"}
              </span>
            ) : (
              <>
                <span className="text-sm font-semibold w-12 text-center">{chance}%</span>
                <Badge
                  variant="outline"
                  className="bg-green-500/10 text-green-600 border-green-500/20 text-xs font-semibold w-[70px] justify-center"
                >
                  Yes {yesCents}c
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-red-500/10 text-red-600 border-red-500/20 text-xs font-semibold w-[70px] justify-center"
                >
                  No {noCents}c
                </Badge>
              </>
            )}
          </Link>
        );
      })}
    </div>
  );
}
