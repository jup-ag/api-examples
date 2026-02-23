"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { EndpointBadge } from "@/components/endpoint-badge";
import { useCreateOrder } from "@/hooks/use-orders";
import type { Market } from "@/lib/api";
import { cn, toRawUsd } from "@/lib/utils";

export function TradePanel({ market }: { market: Market }) {
  const { publicKey } = useWallet();
  const createOrder = useCreateOrder();

  const [isYes, setIsYes] = useState(true);
  const [amount, setAmount] = useState("");

  const price = isYes
    ? market.pricing.buyYesPriceUsd
    : market.pricing.buyNoPriceUsd;

  const priceUsd = price ? toRawUsd(price) : null;
  const chance = priceUsd ? (priceUsd * 100).toFixed(1) : "—";
  const parsedAmount = Number(amount);
  const estimatedContracts = priceUsd && parsedAmount > 0 ? (parsedAmount / priceUsd).toFixed(2) : "0";
  const potentialPayout = priceUsd && parsedAmount > 0 ? (parsedAmount / priceUsd).toFixed(2) : "0";
  const isValidAmount = parsedAmount >= 1;

  const handleSubmit = () => {
    if (!isValidAmount || !publicKey) return;

    createOrder.mutate(
      {
        marketId: market.marketId,
        isYes,
        isBuy: true,
        depositAmount: parsedAmount * 1_000_000,
      },
      { onSuccess: () => setAmount("") }
    );
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        {/* Market context */}
        <div className="space-y-1">
          <p className="text-sm font-medium leading-snug">{market.metadata.title}</p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              Buy {isYes ? "Yes" : "No"}
            </span>
            <EndpointBadge number={9} method="POST" path="/orders" description="Submit a new order (buy or sell YES/NO)" />
          </div>
        </div>

        <Separator />

        {/* Side toggle */}
        <div className="grid grid-cols-2 gap-1 rounded-md bg-muted/50 p-1">
          <button
            onClick={() => setIsYes(true)}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-semibold transition-colors",
              isYes
                ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/25"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Yes
          </button>
          <button
            onClick={() => setIsYes(false)}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-semibold transition-colors",
              !isYes
                ? "bg-red-500 text-white shadow-sm shadow-red-500/25"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            No
          </button>
        </div>

        {/* Amount input */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-muted-foreground">You're paying</label>
            <span className="text-xs text-muted-foreground">USDC</span>
          </div>
          <Input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="0"
            step="0.01"
            className="text-lg font-mono font-semibold h-12"
          />
        </div>

        {/* Odds */}
        <div className="rounded-md border border-border/30 bg-muted/30 p-3 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Odds</span>
            <span className="font-mono font-semibold">{chance}% chance</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Est. contracts</span>
            <span className="font-mono font-medium">{estimatedContracts}</span>
          </div>
          {Number(amount) > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Potential payout</span>
              <span className="font-mono font-medium text-emerald-400">${potentialPayout}</span>
            </div>
          )}
        </div>

        {/* CTA */}
        <Button
          className={cn(
            "w-full h-11 text-sm font-semibold",
            isYes
              ? "bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20"
              : "bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20"
          )}
          onClick={handleSubmit}
          disabled={!publicKey || !isValidAmount || createOrder.isPending || market.metadata.isTradable === false}
        >
          {market.metadata.isTradable === false
            ? "Market Not Tradable"
            : !publicKey
              ? "Connect Wallet"
              : createOrder.isPending
                ? "Submitting..."
                : !amount
                  ? "Enter Amount"
                  : !isValidAmount
                    ? "Minimum $1.00"
                    : `Buy ${isYes ? "Yes" : "No"} — $${parsedAmount.toFixed(2)}`}
        </Button>
      </CardContent>
    </Card>
  );
}
