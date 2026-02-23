"use client";

import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { EndpointBadge } from "@/components/endpoint-badge";
import { usePnlHistory } from "@/hooks/use-profile";
import { toRawUsd } from "@/lib/utils";

const INTERVALS = [
  { label: "24h", value: "24h" },
  { label: "1W", value: "1w" },
  { label: "1M", value: "1m" },
];

const COUNTS = ["10", "30", "50", "100"];

export function PnlChart({ ownerPubkey }: { ownerPubkey: string }) {
  const [timeInterval, setTimeInterval] = useState("1w");
  const [count, setCount] = useState(30);
  const { data: pnlHistory, isLoading } = usePnlHistory(ownerPubkey, timeInterval, count);

  const chartData = pnlHistory?.map((point) => ({
    timestamp: new Date(point.timestamp * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    pnl: toRawUsd(point.realizedPnlUsd),
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-medium">PnL Over Time</CardTitle>
            <EndpointBadge number={21} method="GET" path="/profiles/{ownerPubkey}/pnl-history" description="Fetch PnL history over time for a user" />
          </div>
          <div className="flex items-center gap-3">
            <ToggleGroup
              type="single"
              value={timeInterval}
              onValueChange={(val) => { if (val) setTimeInterval(val); }}
              size="sm"
            >
              {INTERVALS.map((i) => (
                <ToggleGroupItem key={i.value} value={i.value}>
                  {i.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <Select value={String(count)} onValueChange={(val) => setCount(Number(val))}>
              <SelectTrigger size="sm" className="text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COUNTS.map((c) => (
                  <SelectItem key={c} value={c}>{c} pts</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-64" />
        ) : !chartData || chartData.length === 0 ? (
          <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
            No PnL data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={256}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="timestamp" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
              <Tooltip
                formatter={(value: number) => [`$${value.toFixed(2)}`, "PnL"]}
                contentStyle={{ fontSize: 12 }}
              />
              <Line
                type="monotone"
                dataKey="pnl"
                stroke="#c7f284"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
