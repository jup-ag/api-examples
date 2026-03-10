"use client";

import Link from "next/link";
import Image from "next/image";
import { microToPercent, microToCents, formatVolume, formatTimeRemaining } from "@/lib/utils";

interface EventCardProps {
  event: any;
}

export default function EventCard({ event }: EventCardProps) {
  const markets = event.markets || [];
  const imageUrl = event.metadata?.imageUrl;
  const title = event.metadata?.title;
  const closeTime = event.metadata?.closeTime
    ? Math.floor(new Date(event.metadata.closeTime).getTime() / 1000)
    : markets[0]?.closeTime;
  const volume = event.volumeUsd;
  const isTwoTeam = markets.length === 2;
  const displayMarkets = isTwoTeam ? markets : markets.slice(0, 3);
  const hasMore = markets.length > 3;
  const eventHref = `/event/${event.eventId}`;

  return (
    <div className="flex flex-col rounded-xl border border-jupiter-border bg-jupiter-card p-5 transition-all hover:border-jupiter-border/80">
      {/* Header */}
      <Link href={eventHref} className="flex gap-3 mb-4 group">
        {imageUrl && (
          <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg">
            <Image src={imageUrl} alt={title || "Event"} fill className="object-cover" sizes="48px" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-white leading-tight line-clamp-2 group-hover:text-jupiter-accent transition-colors">
            {title}
          </h3>
          {closeTime && (
            <p className="mt-0.5 text-xs text-jupiter-muted">
              Live in {formatTimeRemaining(closeTime)}
            </p>
          )}
        </div>
      </Link>

      {/* Markets */}
      <div className="flex-1">
        {isTwoTeam ? (
          <TwoTeamView markets={markets} eventHref={eventHref} />
        ) : (
          <ListView markets={displayMarkets} eventHref={eventHref} />
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between">
        <Link
          href={eventHref}
          className="text-xs font-medium text-jupiter-accent hover:text-jupiter-accent-dim transition-colors"
        >
          {hasMore ? "Show More" : "View Event"} &rsaquo;
        </Link>
        {volume && (
          <span className="text-xs text-jupiter-muted">
            {formatVolume(volume)} vol
          </span>
        )}
      </div>
    </div>
  );
}

function TwoTeamView({ markets, eventHref }: { markets: any[]; eventHref: string }) {
  const colors = [
    { bg: "bg-teal-950/60", text: "text-teal-400", border: "border-teal-800/40" },
    { bg: "bg-orange-950/60", text: "text-orange-400", border: "border-orange-800/40" },
  ];

  return (
    <div className="flex gap-2">
      {markets.map((m: any, i: number) => {
        const c = colors[i] || colors[0];
        const price = m.pricing?.buyYesPriceUsd;
        return (
          <Link
            key={m.marketId}
            href={eventHref}
            className={`flex-1 rounded-lg ${c.bg} border ${c.border} px-3 py-3 text-center transition-all hover:brightness-125`}
          >
            <span className={`text-sm font-semibold ${c.text}`}>
              {m.metadata?.title} {price ? microToCents(price) : ""}
            </span>
          </Link>
        );
      })}
    </div>
  );
}

function ListView({ markets, eventHref }: { markets: any[]; eventHref: string }) {
  return (
    <div className="space-y-2.5">
      {markets.map((m: any) => {
        const yesPrice = m.pricing?.buyYesPriceUsd;
        return (
          <Link
            key={m.marketId}
            href={eventHref}
            className="flex items-center justify-between gap-2 group"
          >
            <span className="text-sm text-jupiter-text group-hover:text-white transition-colors truncate">
              {m.metadata?.title}
            </span>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-sm font-bold text-white">
                {yesPrice ? microToPercent(yesPrice) : "—"}
              </span>
              <div className="flex items-center gap-1 text-[11px] font-medium">
                <span className="rounded bg-jupiter-green/15 px-1.5 py-0.5 text-jupiter-green hover:bg-jupiter-green/25 transition-colors">
                  Yes
                </span>
                <span className="text-jupiter-muted">/</span>
                <span className="rounded bg-jupiter-red/15 px-1.5 py-0.5 text-jupiter-red hover:bg-jupiter-red/25 transition-colors">
                  No
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
