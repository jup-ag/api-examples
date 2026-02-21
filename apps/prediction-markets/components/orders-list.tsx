"use client";

import { Fragment, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EndpointBadge } from "@/components/endpoint-badge";
import { EmptyState } from "@/components/empty-state";
import { SkeletonList } from "@/components/skeleton-list";
import { useOrders, useOrder, useOrderStatus } from "@/hooks/use-orders";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, toDisplayUsd, timeAgo, truncateAddress } from "@/lib/utils";

const tourFallback = (
  <div className="flex items-center gap-2 px-3 pt-2">
    <EndpointBadge tourOnly number={11} method="GET" path="/orders/{orderPubkey}" description="Fetch full order details by pubkey" />
    <EndpointBadge tourOnly number={12} method="GET" path="/orders/status/{orderPubkey}" description="Poll order status until filled or failed" />
  </div>
);

function OrderDetail({ orderPubkey }: { orderPubkey: string }) {
  const { data: order, isLoading } = useOrder(orderPubkey);
  const { data: status } = useOrderStatus(orderPubkey);

  if (isLoading) return <Skeleton className="h-16" />;
  if (!order) return null;

  return (
    <TableRow>
      <TableCell colSpan={7} className="bg-muted/50 p-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <EndpointBadge number={11} method="GET" path="/orders/{orderPubkey}" description="Fetch full order details by pubkey" />
            {status && (
              <EndpointBadge number={12} method="GET" path="/orders/status/{orderPubkey}" description="Poll order status until filled or failed" />
            )}
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs sm:grid-cols-4">
            <div>
              <span className="text-muted-foreground">Order ID: </span>
              <span className="font-mono">{order.orderId}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Size: </span>
              <span>{toDisplayUsd(order.sizeUsd)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Max Fill Price: </span>
              <span>{toDisplayUsd(order.maxFillPriceUsd)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Event: </span>
              <span>{order.eventMetadata?.title ?? "—"}</span>
            </div>
            {status && (
              <>
                <div>
                  <span className="text-muted-foreground">Latest Event: </span>
                  <span className="capitalize">{status.latestEventType?.replace(/_/g, " ") ?? "—"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Status: </span>
                  <span className="capitalize">{status.status}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
}

export function OrdersList() {
  const { publicKey } = useWallet();
  const { data: orders, isLoading } = useOrders(publicKey?.toBase58());
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  if (!publicKey) {
    return (
      <div>
        <EmptyState message="Connect wallet to view orders" />
        {tourFallback}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        {tourFallback}
        <SkeletonList count={3} className="h-12" />
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div>
        <EmptyState message="No orders yet" />
        {tourFallback}
      </div>
    );
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order</TableHead>
            <TableHead>Side</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Contracts</TableHead>
            <TableHead>Avg Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <Fragment key={order.pubkey}>
              <TableRow
                className={cn("cursor-pointer hover:bg-muted/50", expandedOrder === order.pubkey && "bg-muted/30")}
                onClick={() => setExpandedOrder(expandedOrder === order.pubkey ? null : order.pubkey)}
              >
                <TableCell className="font-mono text-xs">{truncateAddress(order.pubkey)}</TableCell>
                <TableCell>
                  <Badge variant={order.isYes ? "default" : "secondary"} className="text-xs">
                    {order.isYes ? "YES" : "NO"}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs">{order.isBuy ? "Buy" : "Sell"}</TableCell>
                <TableCell className="text-xs">
                  {order.filledContracts}/{order.contracts}
                </TableCell>
                <TableCell className="text-xs">{toDisplayUsd(order.avgFillPriceUsd)}</TableCell>
                <TableCell>
                  <Badge
                    variant={order.status === "filled" ? "default" : order.status === "failed" ? "destructive" : "secondary"}
                    className="text-xs capitalize"
                  >
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">{timeAgo(order.createdAt)}</TableCell>
              </TableRow>
              {expandedOrder === order.pubkey && (
                <OrderDetail orderPubkey={order.pubkey} />
              )}
            </Fragment>
          ))}
        </TableBody>
      </Table>
      {!expandedOrder && tourFallback}
    </div>
  );
}
