"use client";

import { use } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MarketsTable } from "@/components/markets-table";
import { OrderbookChart } from "@/components/orderbook-chart";
import { TradePanel } from "@/components/trade-panel";
import { RelatedEvents } from "@/components/related-events";
import { OrdersList } from "@/components/orders-list";
import { EndpointBadge } from "@/components/endpoint-badge";
import { EmptyState } from "@/components/empty-state";
import { useMarket, useEventMarkets, useForecast } from "@/hooks/use-markets";
import { useEvent } from "@/hooks/use-events";
import { formatNumber, countdown, toRawUsd } from "@/lib/utils";

export default function MarketPage({ params }: { params: Promise<{ marketId: string }> }) {
  const { marketId } = use(params);
  const searchParams = useSearchParams();
  const eventId = searchParams.get("event") ?? undefined;

  const { data: market, isLoading, error } = useMarket(marketId);
  const { data: event } = useEvent(eventId ?? "");
  const { data: allMarkets } = useEventMarkets(eventId ?? "");
  const { data: forecast } = useForecast();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-12 w-full" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Skeleton className="h-96 lg:col-span-2" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (error || !market) {
    return <EmptyState card message="Market not found" />;
  }

  const yesPrice = toRawUsd(market.pricing.buyYesPriceUsd ?? 500000);
  const noPrice = toRawUsd(market.pricing.buyNoPriceUsd ?? 500000);
  const yesPercent = Math.round(yesPrice * 100);
  const noPercent = 100 - yesPercent;
  const hasMultipleMarkets = allMarkets && allMarkets.length > 1;
  const eventVolume = event?.volumeUsd
    ? formatNumber(toRawUsd(event.volumeUsd))
    : formatNumber(market.pricing.volume);

  return (
    <div className="space-y-6">
      {/* Back + Event Header */}
      <div className="space-y-3">
        <Link
          href="/discover"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>

        <div className="flex items-start gap-4">
          {event?.metadata.imageUrl && (
            <img
              src={event.metadata.imageUrl}
              alt=""
              className="h-12 w-12 rounded-lg object-cover shrink-0"
            />
          )}
          <div className="space-y-1 min-w-0">
            {event && (
              <span className="text-xs font-medium text-muted-foreground capitalize">
                {event.category}
              </span>
            )}
            <h1 className="text-xl font-bold leading-tight">
              {event?.metadata.title ?? market.metadata.title}
            </h1>
            <div className="flex items-center gap-3 flex-wrap">
              {eventId && (
                <EndpointBadge number={5} method="GET" path="/events/{eventId}" description="Fetch parent event details (title, image, category)" />
              )}
              {event?.isLive && (
                <Badge className="bg-yes/10 text-[10px] text-yes-soft border border-yes/20 hover:bg-yes/10">Live</Badge>
              )}
              {event?.isTrending && (
                <Badge className="bg-amber-500/10 text-[10px] text-amber-400 border border-amber-500/20 hover:bg-amber-500/10">Trending</Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Volume + Close time summary */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
        <span className="font-mono font-medium text-foreground">${eventVolume} vol</span>
        {market.pricing.liquidityDollars != null && (
          <span>${formatNumber(toRawUsd(market.pricing.liquidityDollars))} liquidity</span>
        )}
        <span>Closes {countdown(market.closeTime)}</span>
        <Badge variant={market.status === "open" ? "default" : "secondary"} className="capitalize text-[10px]">
          {market.status}
        </Badge>
        {market.metadata.isTradable === false && (
          <Badge variant="destructive" className="text-[10px]">Not Tradable</Badge>
        )}
        <EndpointBadge number={6} method="GET" path="/markets/{marketId}" description="Fetch market details including pricing and status" />
        <EndpointBadge number={7} method="GET" path="/forecast" description="Aggregated forecast data for prediction markets" />
      </div>

      {/* Main grid: content left, trade panel right */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Orderbook for selected market */}
          <OrderbookChart marketId={market.marketId} />

          {/* All markets table for multi-market events */}
          {hasMultipleMarkets && (
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Markets</CardTitle>
                  <EndpointBadge number={13} method="GET" path="/events/{eventId}/markets" description="List all markets belonging to this event" />
                </div>
              </CardHeader>
              <CardContent>
                <MarketsTable markets={allMarkets} selectedMarketId={marketId} eventId={eventId} />
              </CardContent>
            </Card>
          )}

          {/* Single market probability bar (no event or single-market event) */}
          {!hasMultipleMarkets && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Probability</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5">
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-xs font-semibold text-yes-soft">
                    Yes {yesPercent}%
                  </span>
                  <span className="font-mono text-xs font-semibold text-no-soft">
                    {noPercent}% No
                  </span>
                </div>
                <div className="flex h-2 overflow-hidden rounded-full">
                  <div
                    className="bg-yes transition-all"
                    style={{ width: `${yesPercent}%` }}
                  />
                  <div className="flex-1 bg-no/40" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tour-only fallback for step 13 when single-market event */}
          {!hasMultipleMarkets && (
            <EndpointBadge tourOnly number={13} method="GET" path="/events/{eventId}/markets" description="List all markets belonging to this event" />
          )}

          {/* Forecast (if available) */}
          {forecast && Object.keys(forecast).length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Forecast</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">Forecast data available for this market.</p>
              </CardContent>
            </Card>
          )}

          {/* Orders */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Your Orders</CardTitle>
                <EndpointBadge number={10} method="GET" path="/orders" description="List all orders for the connected wallet" />
              </div>
            </CardHeader>
            <CardContent>
              <OrdersList />
            </CardContent>
          </Card>

          {/* Rules */}
          {market.metadata.rulesPrimary && (
            <Card>
              <CardContent className="p-4">
                <p className="mb-1 text-xs font-medium text-muted-foreground">Rules</p>
                <p className="text-xs leading-relaxed text-muted-foreground">{market.metadata.rulesPrimary}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right column: trade panel + related events */}
        <div className="space-y-6">
          <TradePanel market={market} />
          <RelatedEvents currentEventId={eventId} />
        </div>
      </div>
    </div>
  );
}
