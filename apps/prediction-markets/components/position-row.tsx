"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TableCell, TableRow } from "@/components/ui/table";
import { EndpointBadge } from "@/components/endpoint-badge";
import { cn, toDisplayUsd, toRawUsd, truncateAddress, timeAgo } from "@/lib/utils";
import { usePosition } from "@/hooks/use-positions";
import type { Position } from "@/lib/api";

interface PositionRowProps {
  position: Position;
  onClose: (pubkey: string) => void;
  isClosing: boolean;
}

function PositionDetail({ positionPubkey }: { positionPubkey: string }) {
  const { data: detail, isLoading } = usePosition(positionPubkey);

  if (isLoading) return <TableRow><TableCell colSpan={8}><Skeleton className="h-16" /></TableCell></TableRow>;
  if (!detail) return null;

  return (
    <TableRow>
      <TableCell colSpan={8} className="bg-muted/50 p-3">
        <div className="space-y-2">
          <EndpointBadge number={15} method="GET" path="/positions/{positionPubkey}" description="Fetch full position details by pubkey" />
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs sm:grid-cols-4">
            <div>
              <span className="text-muted-foreground">Position: </span>
              <span className="font-mono">{truncateAddress(detail.pubkey, 6)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Total Cost: </span>
              <span>{toDisplayUsd(detail.totalCostUsd)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Fees Paid: </span>
              <span>{toDisplayUsd(detail.feesPaidUsd)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Realized PnL: </span>
              <span>{toDisplayUsd(detail.realizedPnlUsd)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Claimable: </span>
              <span>{detail.claimable ? "Yes" : "No"}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Payout: </span>
              <span>{toDisplayUsd(detail.payoutUsd)}</span>
            </div>
            {detail.sellPriceUsd && (
              <div>
                <span className="text-muted-foreground">Sell Price: </span>
                <span>{toDisplayUsd(detail.sellPriceUsd)}</span>
              </div>
            )}
            {detail.pnlUsdAfterFees && (
              <div>
                <span className="text-muted-foreground">PnL After Fees: </span>
                <span>{toDisplayUsd(detail.pnlUsdAfterFees)}</span>
              </div>
            )}
            {detail.openedAt && (
              <div>
                <span className="text-muted-foreground">Opened: </span>
                <span>{timeAgo(detail.openedAt)}</span>
              </div>
            )}
            {detail.updatedAt && (
              <div>
                <span className="text-muted-foreground">Updated: </span>
                <span>{timeAgo(detail.updatedAt)}</span>
              </div>
            )}
            {detail.openOrders > 0 && (
              <div>
                <span className="text-muted-foreground">Open Orders: </span>
                <span>{detail.openOrders}</span>
              </div>
            )}
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
}

export function PositionRow({ position, onClose, isClosing }: PositionRowProps) {
  const [expanded, setExpanded] = useState(false);
  const pnl = position.pnlUsd ? toRawUsd(position.pnlUsd) : 0;
  const pnlPct = position.pnlUsdPercent ?? 0;

  return (
    <>
      <TableRow
        className={cn("cursor-pointer hover:bg-muted/50", expanded && "bg-muted/30")}
        onClick={() => setExpanded(!expanded)}
      >
        <TableCell className="text-xs">
          {position.eventMetadata?.title && (
            <span className="block text-muted-foreground">{position.eventMetadata.title}</span>
          )}
          <span className="font-medium">{position.marketMetadata?.title ?? truncateAddress(position.marketId, 8)}</span>
        </TableCell>
        <TableCell>
          <Badge variant={position.isYes ? "default" : "secondary"} className="text-xs">
            {position.isYes ? "YES" : "NO"}
          </Badge>
        </TableCell>
        <TableCell className="font-mono text-xs">{position.contracts}</TableCell>
        <TableCell className="font-mono text-xs">{toDisplayUsd(position.avgPriceUsd)}</TableCell>
        <TableCell className="font-mono text-xs">{position.markPriceUsd ? toDisplayUsd(position.markPriceUsd) : "—"}</TableCell>
        <TableCell className={cn("font-mono text-xs font-medium", pnl > 0 ? "text-yes-soft" : pnl < 0 ? "text-no-soft" : "")}>
          {toDisplayUsd(position.pnlUsd ?? "0")} ({pnlPct > 0 ? "+" : ""}
          {pnlPct.toFixed(1)}%)
        </TableCell>
        <TableCell className="font-mono text-xs">{position.valueUsd ? toDisplayUsd(position.valueUsd) : "—"}</TableCell>
        <TableCell>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onClose(position.pubkey);
            }}
            disabled={isClosing}
          >
            Close
          </Button>
        </TableCell>
      </TableRow>
      {expanded && <PositionDetail positionPubkey={position.pubkey} />}
    </>
  );
}
