"use client";

import { useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { getMarket } from "@/lib/jupiter";
import { useAutoRefresh } from "@/lib/hooks";
import OrderBook from "@/components/OrderBook";
import PlaceBet from "@/components/PlaceBet";
import Spinner from "@/components/Spinner";
import { microToPercent, microToCents, formatTimeRemaining, formatDate, cn } from "@/lib/utils";

export default function MarketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const marketId = params.id as string;

  const fetcher = useCallback(() => getMarket(marketId), [marketId]);
  const { data: market, loading, refresh } = useAutoRefresh(fetcher);

  if (loading && !market) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!market || !market.marketId) {
    return (
      <div className="rounded-xl border border-jupiter-border bg-jupiter-card p-12 text-center">
        <p className="text-jupiter-muted">Market not found</p>
        <button
          onClick={() => router.push("/")}
          className="mt-4 rounded-lg bg-jupiter-accent px-4 py-2 text-sm font-semibold text-jupiter-bg"
        >
          Back to Markets
        </button>
      </div>
    );
  }

  const yesPrice = market.pricing?.buyYesPriceUsd;
  const noPrice = market.pricing?.buyNoPriceUsd;
  const sellYes = market.pricing?.sellYesPriceUsd;
  const sellNo = market.pricing?.sellNoPriceUsd;
  const imageUrl = market.metadata?.imageUrl;
  const closeTime = market.closeTime;

  return (
    <div>
      {/* Back */}
      <button
        onClick={() => router.back()}
        className="mb-4 flex items-center gap-1 text-sm text-jupiter-muted hover:text-jupiter-text transition-colors"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Left: Market info + Orderbook */}
        <div className="lg:col-span-2 space-y-4">
          {/* Market header */}
          <div className="rounded-xl border border-jupiter-border bg-jupiter-card p-5">
            <div className="flex gap-4">
              {imageUrl && (
                <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl">
                  <Image src={imageUrl} alt={market.metadata?.title || ""} fill className="object-cover" sizes="56px" />
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {market.status === "open" && (
                    <span className="rounded-full bg-jupiter-green/20 px-2 py-0.5 text-[10px] font-bold text-jupiter-green">
                      OPEN
                    </span>
                  )}
                  {market.status === "closed" && (
                    <span className="rounded-full bg-jupiter-muted/20 px-2 py-0.5 text-[10px] font-bold text-jupiter-muted">
                      CLOSED
                    </span>
                  )}
                  {market.result && (
                    <span className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-bold",
                      market.result === "yes"
                        ? "bg-jupiter-green/20 text-jupiter-green"
                        : "bg-jupiter-red/20 text-jupiter-red"
                    )}>
                      Result: {market.result.toUpperCase()}
                    </span>
                  )}
                </div>
                <h1 className="text-xl font-bold text-white">{market.metadata?.title}</h1>
                {closeTime && (
                  <p className="mt-1 text-sm text-jupiter-muted">
                    Closes in {formatTimeRemaining(closeTime)} ({formatDate(closeTime)})
                  </p>
                )}
              </div>
            </div>

            {/* Prices */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-jupiter-green/10 p-3 text-center">
                <div className="text-[11px] font-medium text-jupiter-muted">Buy Yes</div>
                <div className="text-xl font-bold text-jupiter-green">
                  {yesPrice ? microToPercent(yesPrice) : "—"}
                </div>
                <div className="text-[11px] text-jupiter-muted">{yesPrice ? microToCents(yesPrice) : ""}</div>
              </div>
              <div className="rounded-xl bg-jupiter-red/10 p-3 text-center">
                <div className="text-[11px] font-medium text-jupiter-muted">Buy No</div>
                <div className="text-xl font-bold text-jupiter-red">
                  {noPrice ? microToPercent(noPrice) : "—"}
                </div>
                <div className="text-[11px] text-jupiter-muted">{noPrice ? microToCents(noPrice) : ""}</div>
              </div>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-jupiter-input p-2 text-center text-[11px]">
                <span className="text-jupiter-muted">Sell Yes: </span>
                <span className="text-jupiter-green font-mono">{sellYes ? microToCents(sellYes) : "—"}</span>
              </div>
              <div className="rounded-lg bg-jupiter-input p-2 text-center text-[11px]">
                <span className="text-jupiter-muted">Sell No: </span>
                <span className="text-jupiter-red font-mono">{sellNo ? microToCents(sellNo) : "—"}</span>
              </div>
            </div>

            {/* Rules */}
            {market.metadata?.rulesPrimary && (
              <details className="mt-4 group">
                <summary className="cursor-pointer text-xs font-medium text-jupiter-muted hover:text-jupiter-text transition-colors">
                  Resolution Rules
                </summary>
                <p className="mt-2 text-xs text-jupiter-text leading-relaxed whitespace-pre-line border-t border-jupiter-border pt-2">
                  {market.metadata.rulesPrimary}
                </p>
              </details>
            )}
          </div>

          {/* Order Book */}
          <OrderBook marketId={marketId} />
        </div>

        {/* Right: Place Bet */}
        <div>
          <PlaceBet
            marketId={marketId}
            yesPriceMicro={yesPrice}
            noPriceMicro={noPrice}
            onSuccess={refresh}
          />
        </div>
      </div>
    </div>
  );
}
