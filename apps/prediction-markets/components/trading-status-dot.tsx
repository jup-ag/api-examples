"use client";

import { useTradingStatus } from "@/hooks/use-markets";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { EndpointBadge } from "@/components/endpoint-badge";

export function TradingStatusDot() {
  const { data, isLoading } = useTradingStatus();

  if (isLoading) return null;

  const active = data?.trading_active ?? false;

  return (
    <div className="flex items-center gap-3">
      <EndpointBadge number={4} method="GET" path="/trading-status" description="Check if trading is currently active or paused" />
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className={`h-2.5 w-2.5 rounded-full transition-shadow ${active ? "bg-yes-soft shadow-[0_0_8px_rgba(52,211,153,0.4)]" : "bg-no shadow-[0_0_8px_rgba(239,68,68,0.4)]"}`} />
            {active ? "Trading Active" : "Trading Paused"}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{active ? "Markets are open for trading" : "Trading is currently paused"}</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
