"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EndpointBadge } from "@/components/endpoint-badge";
import { formatNumber, countdown } from "@/lib/utils";
import type { Market } from "@/lib/api";

export function MarketDetail({ market }: { market: Market }) {
  const yesPrice = (market.pricing.buyYesPriceUsd ?? 500000) / 1_000_000;
  const noPrice = (market.pricing.buyNoPriceUsd ?? 500000) / 1_000_000;
  const yesPct = (yesPrice * 100).toFixed(1);
  const noPct = (noPrice * 100).toFixed(1);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <EndpointBadge number={6} method="GET" path="/markets/{marketId}" description="Fetch market details including pricing and status" />
      </div>

      <div className="flex items-center gap-2">
        <div className="flex h-8 flex-1 overflow-hidden rounded-full bg-muted text-sm font-semibold">
          <div
            className="flex items-center justify-center bg-green-500 text-white transition-all"
            style={{ width: `${yesPrice * 100}%` }}
          >
            YES {yesPct}%
          </div>
          <div className="flex flex-1 items-center justify-center bg-red-500 text-white">NO {noPct}%</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Card>
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Volume</p>
            <p className="text-sm font-semibold">{formatNumber(market.pricing.volume)} contracts</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Closes</p>
            <p className="text-sm font-semibold">{countdown(market.closeTime)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <p className="text-xs text-muted-foreground">Result</p>
            <p className="text-sm font-semibold capitalize">{market.result ?? "Pending"}</p>
          </CardContent>
        </Card>
        {market.pricing.openInterest != null && (
          <Card>
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground">Open Interest</p>
              <p className="text-sm font-semibold">{formatNumber(market.pricing.openInterest)}</p>
            </CardContent>
          </Card>
        )}
        {market.pricing.liquidityDollars != null && (
          <Card>
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground">Liquidity</p>
              <p className="text-sm font-semibold">${formatNumber(market.pricing.liquidityDollars / 1_000_000)}</p>
            </CardContent>
          </Card>
        )}
        {market.pricing.volume24h != null && (
          <Card>
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground">24h Volume</p>
              <p className="text-sm font-semibold">{formatNumber(market.pricing.volume24h)}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {market.metadata.rulesPrimary && (
        <Card>
          <CardContent className="p-4">
            <p className="mb-1 text-xs font-medium text-muted-foreground">Rules</p>
            <p className="text-xs leading-relaxed text-muted-foreground">{market.metadata.rulesPrimary}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
