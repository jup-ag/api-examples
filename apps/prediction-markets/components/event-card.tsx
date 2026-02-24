"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatNumber, toRawUsd } from "@/lib/utils";
import type { PredictionEvent } from "@/lib/api";

export function EventCard({ event }: { event: PredictionEvent }) {
  const marketCount = event.markets?.length ?? 0;
  const firstMarket = event.markets?.[0];
  const href = firstMarket
    ? `/market/${firstMarket.marketId}?event=${event.eventId}`
    : `/discover`;

  const yesPrice = toRawUsd(firstMarket?.pricing.buyYesPriceUsd ?? 500000);
  const yesPercent = Math.round(yesPrice * 100);
  const noPercent = 100 - yesPercent;

  return (
    <Link href={href}>
      <Card className="group gap-0 overflow-hidden py-0 transition-all duration-300 hover:border-primary/30 hover:shadow-[0_0_15px_-5px_rgba(199,242,132,0.12)]">
        {/* Image with category overlay */}
        <div className="relative aspect-[2/1] w-full overflow-hidden bg-muted">
          {event.metadata.imageUrl ? (
            <Image
              src={event.metadata.imageUrl}
              alt={event.metadata.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-3xl font-bold text-muted-foreground/20">
              {event.category.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-black/80 via-black/30 to-transparent px-3 pb-2 pt-8">
            <Badge className="bg-black/50 text-[10px] text-white capitalize backdrop-blur-sm hover:bg-black/50">
              {event.category}
            </Badge>
            <div className="flex gap-1">
              {event.isLive && (
                <Badge className="bg-yes/10 text-[10px] text-yes-soft border border-yes/20 hover:bg-yes/10">Live</Badge>
              )}
              {event.isTrending && (
                <Badge className="bg-amber-500/10 text-[10px] text-amber-400 border border-amber-500/20 hover:bg-amber-500/10">Trending</Badge>
              )}
            </div>
          </div>
        </div>

        <CardContent className="space-y-2.5 p-3">
          <h3 className="text-sm font-semibold leading-snug line-clamp-2">
            {event.metadata.title}
          </h3>

          {firstMarket && (
            <div className="space-y-1.5">
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-xs font-semibold text-yes-soft">
                  Yes {yesPercent}%
                </span>
                <span className="font-mono text-xs font-semibold text-no-soft">
                  {noPercent}% No
                </span>
              </div>
              <div className="flex h-1.5 overflow-hidden rounded-full">
                <div
                  className="bg-yes transition-all"
                  style={{ width: `${yesPercent}%` }}
                />
                <div className="flex-1 bg-no/40" />
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 font-mono text-[11px] text-muted-foreground">
            {event.volumeUsd && (
              <span>Vol ${formatNumber(toRawUsd(event.volumeUsd))}</span>
            )}
            {event.tvlDollars && (
              <span>TVL ${formatNumber(toRawUsd(event.tvlDollars))}</span>
            )}
            {marketCount > 1 && <span>{marketCount} markets</span>}
            {event.series && <span>{event.series}</span>}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
