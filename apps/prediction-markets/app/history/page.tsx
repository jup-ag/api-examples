"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EndpointBadge } from "@/components/endpoint-badge";
import { EmptyState } from "@/components/empty-state";
import { SkeletonList } from "@/components/skeleton-list";
import { usePositions, useClaimPosition } from "@/hooks/use-positions";
import { useHistory } from "@/hooks/use-history";
import { cn, toDisplayUsd, timeAgo, truncateAddress } from "@/lib/utils";
import type { HistoryEvent } from "@/lib/api";
import {
  ShoppingCart,
  CheckCircle,
  XCircle,
  Gift,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";

const EVENT_ICONS: Record<string, React.ElementType> = {
  order_created: ShoppingCart,
  order_filled: CheckCircle,
  order_failed: XCircle,
  payout_claimed: Gift,
  position_updated: RefreshCw,
  position_lost: AlertTriangle,
};

const EVENT_COLORS: Record<string, string> = {
  order_created: "text-blue-500",
  order_filled: "text-yes",
  order_failed: "text-no",
  payout_claimed: "text-yellow-500",
  position_updated: "text-muted-foreground",
  position_lost: "text-no",
};

function HistoryItem({ event }: { event: HistoryEvent }) {
  const Icon = EVENT_ICONS[event.eventType] ?? RefreshCw;
  const color = EVENT_COLORS[event.eventType] ?? "text-muted-foreground";

  return (
    <div className="flex items-start gap-3 py-3">
      <div className={cn("mt-0.5", color)}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-[10px] capitalize">
            {event.eventType.replace(/_/g, " ")}
          </Badge>
          <span className="text-xs text-muted-foreground">{timeAgo(event.timestamp)}</span>
        </div>
        {(event.eventMetadata?.title || event.marketMetadata?.title) && (
          <p className="text-xs font-medium">
            {event.eventMetadata?.title}
            {event.eventMetadata?.title && event.marketMetadata?.title && " — "}
            {event.marketMetadata?.title}
          </p>
        )}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>{event.isYes ? "YES" : "NO"} / {event.isBuy ? "Buy" : "Sell"}</span>
          <span>{event.filledContracts}/{event.contracts} contracts</span>
          {event.avgFillPriceUsd && <span>@ {toDisplayUsd(event.avgFillPriceUsd)}</span>}
          {event.feeUsd && <span>Fee: {toDisplayUsd(event.feeUsd)}</span>}
          {event.realizedPnl && (
            <span className={cn("font-mono", Number(event.realizedPnl) > 0 ? "text-yes-soft" : "text-no-soft")}>
              PnL: {toDisplayUsd(event.realizedPnl)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function HistoryPage() {
  const { publicKey } = useWallet();
  const pubkey = publicKey?.toBase58();
  const { data: positions, isLoading: positionsLoading } = usePositions(pubkey);
  const { data: history, isLoading: historyLoading } = useHistory(pubkey);
  const claimPosition = useClaimPosition();
  const [typeFilter, setTypeFilter] = useState<string | null>(null);

  const claimablePositions = positions?.filter((p) => p.claimable && !p.claimed) ?? [];

  const filteredHistory = typeFilter ? history?.filter((h) => h.eventType === typeFilter) : history;

  const eventTypes = Array.from(new Set(history?.map((h) => h.eventType) ?? []));

  if (!publicKey) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">History</h1>
        <EmptyState card message="Connect your wallet to view history" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Claiming & History</h1>

      {claimablePositions.length === 0 && (
        <EndpointBadge tourOnly number={19} method="POST" path="/positions/{pubkey}/claim" description="Claim payout from a winning position" />
      )}
      {claimablePositions.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-medium">Claimable Positions</CardTitle>
                <EndpointBadge number={19} method="POST" path="/positions/{pubkey}/claim" description="Claim payout from a winning position" />
              </div>
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  claimablePositions.forEach((p) => claimPosition.mutate(p.pubkey));
                }}
                disabled={claimPosition.isPending}
              >
                Claim All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {claimablePositions.map((position) => (
              <div key={position.pubkey} className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {position.eventMetadata?.title ?? truncateAddress(position.marketId, 8)}
                    </span>
                    <Badge variant={position.isYes ? "default" : "secondary"} className="text-xs">
                      {position.isYes ? "YES" : "NO"}
                    </Badge>
                  </div>
                  {position.marketMetadata?.title && (
                    <p className="text-xs font-medium">{position.marketMetadata.title}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {position.contracts} contracts &middot; Payout: {toDisplayUsd(position.payoutUsd)}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => claimPosition.mutate(position.pubkey)}
                  disabled={claimPosition.isPending}
                >
                  Claim
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Event History</CardTitle>
            <EndpointBadge number={18} method="GET" path="/history" description="Fetch trading event timeline for the connected wallet" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-wrap gap-2">
            <Badge
              variant={typeFilter === null ? "default" : "outline"}
              className="cursor-pointer text-xs"
              onClick={() => setTypeFilter(null)}
            >
              All
            </Badge>
            {eventTypes.map((type) => (
              <Badge
                key={type}
                variant={typeFilter === type ? "default" : "outline"}
                className="cursor-pointer text-xs capitalize"
                onClick={() => setTypeFilter(typeFilter === type ? null : type)}
              >
                {type.replace(/_/g, " ")}
              </Badge>
            ))}
          </div>

          {historyLoading ? (
            <div className="space-y-2">
              <SkeletonList count={5} className="h-16" />
            </div>
          ) : !filteredHistory || filteredHistory.length === 0 ? (
            <EmptyState message="No history yet" />
          ) : (
            <div className="divide-y">
              {filteredHistory.map((event) => (
                <HistoryItem key={event.id} event={event} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
