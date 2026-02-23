"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { LeaderboardTable } from "@/components/leaderboard-table";
import { TradesFeed } from "@/components/trades-feed";
import { EndpointBadge } from "@/components/endpoint-badge";
import { useTour, TOUR_STEPS } from "@/components/guided-tour";
import { useLeaderboards, useVaultInfo } from "@/hooks/use-social";
import { toRawUsd } from "@/lib/utils";

export default function CommunityPage() {
  const [period, setPeriod] = useState("all_time");
  const [metric, setMetric] = useState("pnl");
  const [activeTab, setActiveTab] = useState("leaderboard");
  const { isActive: tourActive, currentStepIndex } = useTour();

  const { data: leaderboard, isLoading: lbLoading } = useLeaderboards({ period, metric });
  const { data: vaultInfo, isLoading: vaultLoading } = useVaultInfo();

  // Auto-switch tabs when the tour targets a badge in a specific tab
  const currentStepNumber = tourActive ? TOUR_STEPS[currentStepIndex]?.number : null;
  useEffect(() => {
    if (currentStepNumber === 23) setActiveTab("trades");
    else if (currentStepNumber === 22) setActiveTab("leaderboard");
  }, [currentStepNumber]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Community</h1>

      {/* #25 — Vault Info + Platform Summary */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {leaderboard?.summary && (
          <>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Total Platform Volume</p>
                <p className="font-mono text-lg font-bold">
                  ${toRawUsd(leaderboard.summary.all_time?.totalVolumeUsd ?? 0).toLocaleString()}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">Total Predictions</p>
                <p className="font-mono text-lg font-bold">{leaderboard.summary.all_time?.predictionsCount?.toLocaleString() ?? "—"}</p>
              </CardContent>
            </Card>
          </>
        )}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Vault Balance</p>
                {vaultLoading ? (
                  <Skeleton className="mt-1 h-7 w-24" />
                ) : (
                  <p className="font-mono text-lg font-bold">
                    {vaultInfo ? `$${toRawUsd(vaultInfo.vaultBalance).toLocaleString()}` : "—"}
                  </p>
                )}
              </div>
              <EndpointBadge number={24} method="GET" path="/vault-info" description="Fetch platform vault balance and data" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="trades">Trades Feed</TabsTrigger>
        </TabsList>

        <TabsContent value="leaderboard" className="space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <ToggleGroup
              type="single"
              value={period}
              onValueChange={(val) => { if (val) setPeriod(val); }}
            >
              <ToggleGroupItem value="all_time">All Time</ToggleGroupItem>
              <ToggleGroupItem value="weekly">Weekly</ToggleGroupItem>
              <ToggleGroupItem value="monthly">Monthly</ToggleGroupItem>
            </ToggleGroup>
            <ToggleGroup
              type="single"
              value={metric}
              onValueChange={(val) => { if (val) setMetric(val); }}
            >
              <ToggleGroupItem value="pnl">PnL</ToggleGroupItem>
              <ToggleGroupItem value="volume">Volume</ToggleGroupItem>
              <ToggleGroupItem value="win_rate">Win Rate</ToggleGroupItem>
            </ToggleGroup>
          </div>

          <Card>
            <CardContent className="p-0">
              <LeaderboardTable entries={leaderboard?.data} isLoading={lbLoading} metric={metric} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trades">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Recent Trades</CardTitle>
            </CardHeader>
            <CardContent>
              <TradesFeed />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
