"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EndpointBadge } from "@/components/endpoint-badge";
import { useOrderbook } from "@/hooks/use-markets";

export function OrderbookChart({ marketId }: { marketId: string }) {
  const { data: orderbook, isLoading } = useOrderbook(marketId);

  if (isLoading) return (
    <div>
      <Skeleton className="h-64" />
      <EndpointBadge tourOnly number={8} method="GET" path="/orderbook/{marketId}" description="Fetch orderbook depth for YES and NO sides" />
    </div>
  );

  if (!orderbook) {
    return (
      <Card>
        <CardContent className="flex h-64 flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
          No orderbook data available
          <EndpointBadge tourOnly number={8} method="GET" path="/orderbook/{marketId}" description="Fetch orderbook depth for YES and NO sides" />
        </CardContent>
      </Card>
    );
  }

  // API returns { yes: [[price_cents, size], ...], no: [[price_cents, size], ...] }
  const yesSide = (orderbook.yes ?? []).map(([price, size]) => ({
    price: price / 100,
    size,
    type: "yes" as const,
  }));
  const noSide = (orderbook.no ?? []).map(([price, size]) => ({
    price: price / 100,
    size,
    type: "no" as const,
  }));

  const data = [
    ...yesSide.sort((a, b) => a.price - b.price),
    ...noSide.sort((a, b) => a.price - b.price),
  ];

  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="flex h-64 flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
          No orderbook data available
          <EndpointBadge tourOnly number={8} method="GET" path="/orderbook/{marketId}" description="Fetch orderbook depth for YES and NO sides" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Order Book Depth</CardTitle>
          <EndpointBadge number={8} method="GET" path="/orderbook/{marketId}" description="Fetch orderbook depth for YES and NO sides" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-3 flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-sm bg-yes" />
            <span className="text-muted-foreground">YES orders</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-sm bg-no" />
            <span className="text-muted-foreground">NO orders</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data}>
            <XAxis dataKey="price" tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}¢`} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip
              formatter={(value: number) => [`${value.toLocaleString()} contracts`, "Size"]}
              labelFormatter={(label) => `Price: ${label}¢`}
            />
            <Bar dataKey="size">
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.type === "yes" ? "var(--color-yes)" : "var(--color-no)"} fillOpacity={0.7} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
