"use client";

import { Badge } from "@/components/ui/badge";
import { EndpointBadge } from "@/components/endpoint-badge";
import { EmptyState } from "@/components/empty-state";
import { SkeletonList } from "@/components/skeleton-list";
import { truncateAddress, timeAgo, toRawUsd } from "@/lib/utils";
import { useTrades } from "@/hooks/use-social";

export function TradesFeed() {
  const { data: trades, isLoading } = useTrades();

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="flex justify-end">
          <EndpointBadge tourOnly number={23} method="GET" path="/trades" description="Fetch recent platform-wide trades" />
        </div>
        <SkeletonList count={8} className="h-14" />
      </div>
    );
  }

  if (!trades || trades.length === 0) {
    return (
      <div>
        <div className="flex justify-end pb-2">
          <EndpointBadge tourOnly number={23} method="GET" path="/trades" description="Fetch recent platform-wide trades" />
        </div>
        <EmptyState message="No recent trades" />
      </div>
    );
  }

  return (
    <div className="divide-y">
      <div className="flex justify-end pb-2">
        <EndpointBadge number={23} method="GET" path="/trades" description="Fetch recent platform-wide trades" />
      </div>
      {trades.map((trade, index) => (
        <div key={trade.id ?? index} className="flex items-center gap-3 py-3">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs">{truncateAddress(trade.ownerPubkey, 4)}</span>
              <Badge variant={trade.action === "buy" ? "default" : "secondary"} className="text-[10px] capitalize">
                {trade.action}
              </Badge>
              <Badge variant={trade.side === "yes" ? "default" : "secondary"} className="text-[10px] uppercase">
                {trade.side}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-1">
              {trade.marketTitle || trade.eventTitle}
            </p>
          </div>
          <div className="text-right">
            <p className="font-mono text-sm font-medium">${toRawUsd(trade.amountUsd).toFixed(2)}</p>
            <p className="font-mono text-xs text-muted-foreground">@ ${toRawUsd(trade.priceUsd).toFixed(4)}</p>
          </div>
          <span className="text-xs text-muted-foreground">{timeAgo(trade.timestamp)}</span>
        </div>
      ))}
    </div>
  );
}
