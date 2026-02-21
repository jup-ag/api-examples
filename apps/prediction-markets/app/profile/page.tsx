"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { Card, CardContent } from "@/components/ui/card";
import { PnlChart } from "@/components/pnl-chart";
import { EndpointBadge } from "@/components/endpoint-badge";
import { EmptyState } from "@/components/empty-state";
import { SkeletonList } from "@/components/skeleton-list";
import { useProfile } from "@/hooks/use-profile";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const { publicKey } = useWallet();
  const pubkey = publicKey?.toBase58();
  const { data: profile, isLoading } = useProfile(pubkey);

  if (!publicKey) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Profile</h1>
          <EndpointBadge tourOnly number={20} method="GET" path="/profiles/{ownerPubkey}" description="Fetch profile stats (PnL, volume, win rate, etc.)" />
        </div>
        <EmptyState card message="Connect your wallet to view your profile" />
      </div>
    );
  }

  const realizedPnl = Number(profile?.realizedPnlUsd ?? 0) / 1_000_000;
  const correct = Number(profile?.correctPredictions ?? 0);
  const wrong = Number(profile?.wrongPredictions ?? 0);

  const stats = [
    { label: "Realized PnL", value: profile ? `$${realizedPnl.toFixed(2)}` : "—", highlight: true },
    { label: "Total Volume", value: profile ? `$${(Number(profile.totalVolumeUsd) / 1_000_000).toFixed(2)}` : "—" },
    { label: "Predictions", value: profile?.predictionsCount ?? "—" },
    {
      label: "Win Rate",
      value: profile ? `${((correct / Math.max(correct + wrong, 1)) * 100).toFixed(1)}%` : "—",
    },
    { label: "Active Contracts", value: profile?.totalActiveContracts ?? "—" },
    { label: "Portfolio Value", value: profile ? `$${(Number(profile.totalPositionsValueUsd) / 1_000_000).toFixed(2)}` : "—" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold">Performance</h1>
        <EndpointBadge number={20} method="GET" path="/profiles/{ownerPubkey}" description="Fetch profile stats (PnL, volume, win rate, etc.)" />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <SkeletonList count={6} className="h-20" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p
                  className={cn(
                    "mt-1 text-lg font-bold",
                    stat.highlight &&
                      profile &&
                      (realizedPnl > 0 ? "text-green-600" : realizedPnl < 0 ? "text-red-600" : "")
                  )}
                >
                  {stat.value}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <PnlChart ownerPubkey={pubkey!} />
    </div>
  );
}
