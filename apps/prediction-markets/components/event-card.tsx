"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatNumber } from "@/lib/utils";
import type { PredictionEvent } from "@/lib/api";

export function EventCard({ event }: { event: PredictionEvent }) {
  const marketCount = event.markets?.length ?? 0;
  const firstMarket = event.markets?.[0];
  const href = firstMarket
    ? `/market/${firstMarket.marketId}?event=${event.eventId}`
    : `/discover`;

  const yesPrice = (firstMarket?.pricing.buyYesPriceUsd ?? 500000) / 1_000_000;
  const noPrice = (firstMarket?.pricing.buyNoPriceUsd ?? 500000) / 1_000_000;
  const yesPercent = Math.round(yesPrice * 100);

  return (
    <Link href={href}>
      <Card className="group gap-0 overflow-hidden py-0 transition-all hover:shadow-md">
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
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-black/60 to-transparent px-3 pb-2 pt-6">
            <Badge className="bg-black/50 text-[10px] text-white capitalize backdrop-blur-sm hover:bg-black/50">
              {event.category}
            </Badge>
            <div className="flex gap-1">
              {event.isLive && (
                <Badge className="bg-green-500/90 text-[10px] text-white hover:bg-green-500/90">Live</Badge>
              )}
              {event.isTrending && (
                <Badge className="bg-orange-500/90 text-[10px] text-white hover:bg-orange-500/90">Trending</Badge>
              )}
            </div>
          </div>
        </div>

        <CardContent className="space-y-2.5 p-3">
          <h3 className="text-sm font-semibold leading-snug line-clamp-2">
            {event.metadata.title}
          </h3>

          {firstMarket && (
            <div className="space-y-1">
              <div className="flex overflow-hidden rounded-full">
                <div
                  className="flex h-5 items-center justify-center bg-green-500 text-[10px] font-bold text-white"
                  style={{ width: `${yesPercent}%`, minWidth: "28px" }}
                >
                  {yesPercent}%
                </div>
                <div
                  className="flex h-5 flex-1 items-center justify-center bg-red-400 text-[10px] font-bold text-white"
                  style={{ minWidth: "28px" }}
                >
                  {Math.round(noPrice * 100)}%
                </div>
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Yes</span>
                <span>No</span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            {event.volumeUsd && (
              <span>Vol ${formatNumber(Number(event.volumeUsd) / 1_000_000)}</span>
            )}
            {event.tvlDollars && (
              <span>TVL ${formatNumber(Number(event.tvlDollars) / 1_000_000)}</span>
            )}
            {marketCount > 1 && <span>{marketCount} markets</span>}
            {event.series && <span>{event.series}</span>}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
