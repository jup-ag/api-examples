"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import { useEvents, useSuggestedEvents } from "@/hooks/use-events";
import { formatNumber } from "@/lib/utils";

export function RelatedEvents({ currentEventId }: { currentEventId?: string }) {
  const { publicKey } = useWallet();
  const { data: suggested } = useSuggestedEvents(publicKey?.toBase58());
  const { data: trendingData } = useEvents({ filter: "trending" });

  const trending = useMemo(
    () => trendingData?.pages.flatMap((p) => p.data) ?? [],
    [trendingData]
  );

  const events = suggested && suggested.length > 0 ? suggested : trending;
  const filtered = events.filter((e) => e.eventId !== currentEventId).slice(0, 5);

  if (filtered.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground">Related Events</h3>
      <div className="space-y-1.5">
        {filtered.map((event) => {
          const firstMarket = event.markets?.[0];
          const href = firstMarket
            ? `/market/${firstMarket.marketId}?event=${event.eventId}`
            : "/discover";

          return (
            <Link
              key={event.eventId}
              href={href}
              className="flex items-center gap-3 rounded-lg border p-2.5 transition-colors hover:bg-muted/50"
            >
              {event.metadata.imageUrl ? (
                <img
                  src={event.metadata.imageUrl}
                  alt=""
                  className="h-9 w-9 rounded-lg object-cover shrink-0"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-xs font-bold text-muted-foreground shrink-0">
                  {event.category.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium leading-snug line-clamp-2">
                  {event.metadata.title}
                </p>
                {event.volumeUsd && (
                  <p className="text-[11px] text-muted-foreground">
                    ${formatNumber(Number(event.volumeUsd) / 1_000_000)} vol
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
