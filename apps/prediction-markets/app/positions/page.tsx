"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PositionRow } from "@/components/position-row";
import { EndpointBadge } from "@/components/endpoint-badge";
import { EmptyState } from "@/components/empty-state";
import { SkeletonList } from "@/components/skeleton-list";
import { usePositions, useClosePosition, useCloseAllPositions } from "@/hooks/use-positions";
import { cn, toRawUsd } from "@/lib/utils";

export default function PositionsPage() {
  const { publicKey } = useWallet();
  const { data: positions, isLoading } = usePositions(publicKey?.toBase58());
  const closePosition = useClosePosition();
  const closeAll = useCloseAllPositions();

  if (!publicKey) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Positions</h1>
          <EndpointBadge tourOnly number={14} method="GET" path="/positions" description="Fetch all open positions for the connected wallet" />
          <EndpointBadge tourOnly number={15} method="GET" path="/positions/{positionPubkey}" description="Fetch full position details by pubkey" />
        </div>
        <EmptyState card message="Connect your wallet to view positions" />
      </div>
    );
  }

  const totalValue = positions?.reduce((sum, p) => sum + toRawUsd(p.valueUsd ?? "0"), 0) ?? 0;
  const totalPnl = positions?.reduce((sum, p) => sum + toRawUsd(p.pnlUsd ?? "0"), 0) ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Positions</h1>
          <EndpointBadge number={14} method="GET" path="/positions" description="Fetch all open positions for the connected wallet" />
        </div>
        {positions && positions.length > 0 && (
          <div className="flex items-center gap-2">
            <EndpointBadge number={17} method="DELETE" path="/positions" description="Close all open positions at once" />
            <Button variant="destructive" size="sm" onClick={() => closeAll.mutate()} disabled={closeAll.isPending}>
              {closeAll.isPending ? "Closing..." : "Close All"}
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="border-l-2 border-l-primary/50">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Value</p>
            <p className="font-mono text-lg font-bold">${totalValue.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="border-l-2 border-l-chart-2/50">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total PnL</p>
            <p className={cn("font-mono text-lg font-bold", totalPnl > 0 ? "text-emerald-400" : totalPnl < 0 ? "text-red-400" : "")}>
              ${totalPnl.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <SkeletonList count={5} className="h-12" />
        </div>
      ) : !positions || positions.length === 0 ? (
        <div className="space-y-2">
          <div className="flex gap-2">
            <EndpointBadge tourOnly number={15} method="GET" path="/positions/{positionPubkey}" description="Fetch full position details by pubkey" />
            <EndpointBadge tourOnly number={16} method="DELETE" path="/positions/{positionPubkey}" description="Close an individual position" />
            <EndpointBadge tourOnly number={17} method="DELETE" path="/positions" description="Close all open positions at once" />
          </div>
          <EmptyState card message="No open positions" />
        </div>
      ) : (
        <Card>
          <CardHeader className="pb-0">
            <div className="flex justify-end gap-2">
              <EndpointBadge tourOnly number={15} method="GET" path="/positions/{positionPubkey}" description="Fetch full position details by pubkey" />
              <EndpointBadge number={16} method="DELETE" path="/positions/{positionPubkey}" description="Close an individual position" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Market</TableHead>
                  <TableHead>Side</TableHead>
                  <TableHead>Contracts</TableHead>
                  <TableHead>Avg Price</TableHead>
                  <TableHead>Mark Price</TableHead>
                  <TableHead>PnL</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {positions.map((position) => (
                  <PositionRow
                    key={position.pubkey}
                    position={position}
                    onClose={(pubkey) => closePosition.mutate(pubkey)}
                    isClosing={closePosition.isPending}
                  />
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
