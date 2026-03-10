"use client";

import { useCallback, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { getEvent } from "@/lib/jupiter";
import { useAutoRefresh } from "@/lib/hooks";
import OrderBook from "@/components/OrderBook";
import PlaceBet from "@/components/PlaceBet";
import Spinner from "@/components/Spinner";
import {
  microToPercent,
  microToCents,
  formatVolume,
  formatTimeRemaining,
  formatDate,
  cn,
} from "@/lib/utils";

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const [selectedMarketId, setSelectedMarketId] = useState<string | null>(null);
  const [marketSearch, setMarketSearch] = useState("");
  const [showAllMarkets, setShowAllMarkets] = useState(false);

  const fetcher = useCallback(() => getEvent(eventId), [eventId]);
  const { data: event, loading, refresh } = useAutoRefresh(fetcher);

  const markets: any[] = event?.markets || [];

  // Sort markets by Yes price (highest probability first)
  const sortedMarkets = useMemo(() => {
    return [...markets].sort((a, b) => {
      const aPrice = Number(a.pricing?.buyYesPriceUsd || 0);
      const bPrice = Number(b.pricing?.buyYesPriceUsd || 0);
      return bPrice - aPrice;
    });
  }, [markets]);

  // Filter markets by search
  const filteredMarkets = useMemo(() => {
    if (!marketSearch.trim()) return sortedMarkets;
    const q = marketSearch.toLowerCase();
    return sortedMarkets.filter((m) =>
      m.metadata?.title?.toLowerCase().includes(q)
    );
  }, [sortedMarkets, marketSearch]);

  // Auto-select first market or find selected
  const selectedMarket = useMemo(() => {
    if (selectedMarketId) {
      return markets.find((m) => m.marketId === selectedMarketId) || sortedMarkets[0];
    }
    return sortedMarkets[0];
  }, [selectedMarketId, markets, sortedMarkets]);

  const displayedMarkets = showAllMarkets ? filteredMarkets : filteredMarkets.slice(0, 10);
  const hasMoreMarkets = filteredMarkets.length > 10 && !showAllMarkets;

  if (loading && !event) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="rounded-xl border border-jupiter-border bg-jupiter-card p-12 text-center">
        <p className="text-jupiter-muted">Event not found</p>
        <button
          onClick={() => router.push("/")}
          className="mt-4 rounded-lg bg-jupiter-accent px-4 py-2 text-sm font-semibold text-jupiter-bg"
        >
          Back to Markets
        </button>
      </div>
    );
  }

  const imageUrl = event.metadata?.imageUrl;
  const title = event.metadata?.title;
  const subtitle = event.metadata?.subtitle;
  const closeTime = event.metadata?.closeTime
    ? Math.floor(new Date(event.metadata.closeTime).getTime() / 1000)
    : markets[0]?.closeTime;
  const volume = event.volumeUsd;

  const selYesPrice = selectedMarket?.pricing?.buyYesPriceUsd;
  const selNoPrice = selectedMarket?.pricing?.buyNoPriceUsd;

  return (
    <div>
      {/* Back */}
      <button
        onClick={() => router.push("/")}
        className="mb-4 flex items-center gap-1 text-sm text-jupiter-muted hover:text-jupiter-text transition-colors"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Markets
      </button>

      {/* Event header */}
      <div className="mb-6 rounded-xl border border-jupiter-border bg-jupiter-card p-5">
        <div className="flex gap-4">
          {imageUrl && (
            <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl">
              <Image src={imageUrl} alt={title || ""} fill className="object-cover" sizes="56px" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-white leading-tight">{title}</h1>
            {subtitle && <p className="mt-0.5 text-sm text-jupiter-muted">{subtitle}</p>}
            <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-jupiter-muted">
              {closeTime && (
                <span>Live in {formatTimeRemaining(closeTime)}</span>
              )}
              {closeTime && (
                <span>Closes {formatDate(closeTime)}</span>
              )}
              {volume && (
                <span className="font-semibold text-jupiter-text">{formatVolume(volume)} vol</span>
              )}
              <span>{markets.length} markets</span>
            </div>
          </div>
        </div>

        {event.closeCondition && (
          <p className="mt-3 text-xs text-jupiter-muted leading-relaxed border-t border-jupiter-border pt-3">
            {event.closeCondition}
          </p>
        )}
      </div>

      {/* Main content: Markets list + Selected market */}
      <div className="grid gap-4 lg:grid-cols-5">
        {/* Left: All markets */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-jupiter-border bg-jupiter-card">
            <div className="p-4 border-b border-jupiter-border">
              <h2 className="text-sm font-semibold text-jupiter-text">
                All Markets ({markets.length})
              </h2>
              {markets.length > 5 && (
                <div className="mt-2 relative">
                  <svg
                    className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-jupiter-muted"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    value={marketSearch}
                    onChange={(e) => setMarketSearch(e.target.value)}
                    placeholder="Filter markets..."
                    className="w-full rounded-lg border border-jupiter-border bg-jupiter-input py-1.5 pl-8 pr-3 text-xs text-jupiter-text placeholder:text-jupiter-muted/50 focus:border-jupiter-accent focus:outline-none"
                  />
                </div>
              )}
            </div>

            <div className="divide-y divide-jupiter-border max-h-[600px] overflow-y-auto">
              {displayedMarkets.map((m: any) => {
                const isActive = m.marketId === selectedMarket?.marketId;
                const yesPrice = m.pricing?.buyYesPriceUsd;
                return (
                  <button
                    key={m.marketId}
                    onClick={() => setSelectedMarketId(m.marketId)}
                    className={cn(
                      "w-full flex items-center justify-between gap-2 px-4 py-3 text-left transition-all hover:bg-jupiter-hover",
                      isActive && "bg-jupiter-hover border-l-2 border-jupiter-accent"
                    )}
                  >
                    <span
                      className={cn(
                        "text-sm truncate",
                        isActive ? "text-white font-semibold" : "text-jupiter-text"
                      )}
                    >
                      {m.metadata?.title}
                    </span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-sm font-bold text-white">
                        {yesPrice ? microToPercent(yesPrice) : "—"}
                      </span>
                      <div className="flex items-center gap-0.5 text-[10px] font-semibold">
                        <span className="rounded bg-jupiter-green/15 px-1.5 py-0.5 text-jupiter-green">
                          Yes
                        </span>
                        <span className="text-jupiter-muted">/</span>
                        <span className="rounded bg-jupiter-red/15 px-1.5 py-0.5 text-jupiter-red">
                          No
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}

              {filteredMarkets.length === 0 && (
                <div className="px-4 py-6 text-center text-xs text-jupiter-muted">
                  No markets match your filter.
                </div>
              )}
            </div>

            {hasMoreMarkets && (
              <div className="border-t border-jupiter-border p-3">
                <button
                  onClick={() => setShowAllMarkets(true)}
                  className="w-full text-center text-xs font-medium text-jupiter-accent hover:text-jupiter-accent-dim transition-colors"
                >
                  Show all {filteredMarkets.length} markets
                </button>
              </div>
            )}
            {showAllMarkets && filteredMarkets.length > 10 && (
              <div className="border-t border-jupiter-border p-3">
                <button
                  onClick={() => setShowAllMarkets(false)}
                  className="w-full text-center text-xs font-medium text-jupiter-muted hover:text-jupiter-text transition-colors"
                >
                  Show less
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right: Selected market detail */}
        <div className="lg:col-span-3 space-y-4">
          {selectedMarket ? (
            <>
              {/* Selected market header */}
              <div className="rounded-xl border border-jupiter-border bg-jupiter-card p-5">
                <div className="flex items-center gap-2 mb-1">
                  {selectedMarket.status === "open" && (
                    <span className="rounded-full bg-jupiter-green/20 px-2 py-0.5 text-[10px] font-bold text-jupiter-green">
                      OPEN
                    </span>
                  )}
                  {selectedMarket.status === "closed" && (
                    <span className="rounded-full bg-jupiter-muted/20 px-2 py-0.5 text-[10px] font-bold text-jupiter-muted">
                      CLOSED
                    </span>
                  )}
                  {selectedMarket.result && (
                    <span className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-bold",
                      selectedMarket.result === "yes"
                        ? "bg-jupiter-green/20 text-jupiter-green"
                        : "bg-jupiter-red/20 text-jupiter-red"
                    )}>
                      Result: {selectedMarket.result.toUpperCase()}
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-white">{selectedMarket.metadata?.title}</h2>

                {/* Price bars */}
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-jupiter-green/10 p-3 text-center">
                    <div className="text-[11px] font-medium text-jupiter-muted">Buy Yes</div>
                    <div className="text-xl font-bold text-jupiter-green">
                      {selYesPrice ? microToPercent(selYesPrice) : "—"}
                    </div>
                    <div className="text-[11px] text-jupiter-muted">
                      {selYesPrice ? microToCents(selYesPrice) : ""}
                    </div>
                  </div>
                  <div className="rounded-xl bg-jupiter-red/10 p-3 text-center">
                    <div className="text-[11px] font-medium text-jupiter-muted">Buy No</div>
                    <div className="text-xl font-bold text-jupiter-red">
                      {selNoPrice ? microToPercent(selNoPrice) : "—"}
                    </div>
                    <div className="text-[11px] text-jupiter-muted">
                      {selNoPrice ? microToCents(selNoPrice) : ""}
                    </div>
                  </div>
                </div>

                {/* Sell prices + stats */}
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-jupiter-input p-2 text-center text-[11px]">
                    <span className="text-jupiter-muted">Sell Yes: </span>
                    <span className="text-jupiter-green font-mono">
                      {selectedMarket.pricing?.sellYesPriceUsd
                        ? microToCents(selectedMarket.pricing.sellYesPriceUsd)
                        : "—"}
                    </span>
                  </div>
                  <div className="rounded-lg bg-jupiter-input p-2 text-center text-[11px]">
                    <span className="text-jupiter-muted">Sell No: </span>
                    <span className="text-jupiter-red font-mono">
                      {selectedMarket.pricing?.sellNoPriceUsd
                        ? microToCents(selectedMarket.pricing.sellNoPriceUsd)
                        : "—"}
                    </span>
                  </div>
                </div>

                {/* Rules (collapsed) */}
                {selectedMarket.metadata?.rulesPrimary && (
                  <details className="mt-4 group">
                    <summary className="cursor-pointer text-xs font-medium text-jupiter-muted hover:text-jupiter-text transition-colors">
                      Resolution Rules
                    </summary>
                    <p className="mt-2 text-xs text-jupiter-text leading-relaxed whitespace-pre-line border-t border-jupiter-border pt-2">
                      {selectedMarket.metadata.rulesPrimary}
                    </p>
                  </details>
                )}
              </div>

              {/* Place Bet */}
              <PlaceBet
                marketId={selectedMarket.marketId}
                yesPriceMicro={selYesPrice}
                noPriceMicro={selNoPrice}
                onSuccess={refresh}
              />

              {/* Order Book */}
              <OrderBook marketId={selectedMarket.marketId} />
            </>
          ) : (
            <div className="rounded-xl border border-jupiter-border bg-jupiter-card p-12 text-center">
              <p className="text-jupiter-muted">Select a market to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
