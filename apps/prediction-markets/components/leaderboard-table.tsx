"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EndpointBadge } from "@/components/endpoint-badge";
import { EmptyState } from "@/components/empty-state";
import { SkeletonList } from "@/components/skeleton-list";
import { truncateAddress } from "@/lib/utils";
import type { LeaderboardEntry } from "@/lib/api";

export function LeaderboardTable({
  entries,
  isLoading,
  metric,
}: {
  entries?: LeaderboardEntry[];
  isLoading: boolean;
  metric: string;
}) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="flex justify-end px-4 pt-3">
          <EndpointBadge tourOnly number={22} method="GET" path="/leaderboards" description="Fetch leaderboard rankings by period and metric" />
        </div>
        <SkeletonList count={10} className="h-10" />
      </div>
    );
  }

  if (!entries || entries.length === 0) {
    return (
      <div>
        <div className="flex justify-end px-4 pt-3">
          <EndpointBadge tourOnly number={22} method="GET" path="/leaderboards" description="Fetch leaderboard rankings by period and metric" />
        </div>
        <EmptyState message="No leaderboard data" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end px-4 pt-3">
        <EndpointBadge number={22} method="GET" path="/leaderboards" description="Fetch leaderboard rankings by period and metric" />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">#</TableHead>
          <TableHead>Trader</TableHead>
          <TableHead className="text-right">
            {metric === "pnl" ? "PnL" : metric === "volume" ? "Volume" : "Win Rate"}
          </TableHead>
          <TableHead className="text-right">Predictions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {entries.map((entry, index) => (
          <TableRow key={entry.ownerPubkey}>
            <TableCell className="font-medium">{index + 1}</TableCell>
            <TableCell className="font-mono text-xs">{truncateAddress(entry.ownerPubkey, 6)}</TableCell>
            <TableCell className="text-right text-sm">
              {metric === "pnl"
                ? `$${(Number(entry.realizedPnlUsd ?? 0) / 1_000_000).toFixed(2)}`
                : metric === "volume"
                  ? `$${(Number(entry.totalVolumeUsd ?? 0) / 1_000_000).toFixed(2)}`
                  : `${entry.winRatePct ?? "0"}%`}
            </TableCell>
            <TableCell className="text-right text-sm">{entry.predictionsCount ?? "—"}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      </Table>
    </div>
  );
}
