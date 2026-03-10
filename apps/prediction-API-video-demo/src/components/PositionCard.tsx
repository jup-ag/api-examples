"use client";

import { useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { VersionedTransaction } from "@solana/web3.js";
import { closePosition, claimPosition } from "@/lib/jupiter";
import { microToUsd, microToCents, formatVolume, cn, getPnlColor, getPnlSign } from "@/lib/utils";

interface PositionCardProps {
  position: any;
  onAction?: () => void;
}

export default function PositionCard({ position, onAction }: PositionCardProps) {
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const [loading, setLoading] = useState<string | null>(null);

  const pnl = microToUsd(position.pnlUsd || 0);
  const cost = microToUsd(position.totalCostUsd || 0);
  const currentVal = microToUsd(position.valueUsd || 0);
  const pnlPercent = position.pnlUsdPercent || (cost > 0 ? (pnl / cost) * 100 : 0);
  const title = position.marketMetadata?.title || position.eventMetadata?.title || position.marketId;
  const subtitle = position.eventMetadata?.title;
  const side = position.isYes ? "yes" : "no";

  const handleClose = async () => {
    if (!publicKey || !signTransaction) return;
    setLoading("close");
    try {
      const res = await closePosition(position.pubkey, publicKey.toBase58());
      if (res.transaction) {
        const tx = VersionedTransaction.deserialize(Buffer.from(res.transaction, "base64"));
        const signed = await signTransaction(tx);
        const sig = await connection.sendRawTransaction(signed.serialize());
        await connection.confirmTransaction(sig, "confirmed");
      }
      onAction?.();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(null);
    }
  };

  const handleClaim = async () => {
    if (!publicKey || !signTransaction) return;
    setLoading("claim");
    try {
      const res = await claimPosition(position.pubkey, publicKey.toBase58());
      if (res.transaction) {
        const tx = VersionedTransaction.deserialize(Buffer.from(res.transaction, "base64"));
        const signed = await signTransaction(tx);
        const sig = await connection.sendRawTransaction(signed.serialize());
        await connection.confirmTransaction(sig, "confirmed");
      }
      onAction?.();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="rounded-xl border border-jupiter-border bg-jupiter-card p-4 transition-all hover:border-jupiter-border/80">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-jupiter-text line-clamp-2">{title}</h4>
          {subtitle && subtitle !== title && (
            <p className="text-xs text-jupiter-muted mt-0.5 truncate">{subtitle}</p>
          )}
          <div className="mt-1 flex items-center gap-2">
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                side === "yes"
                  ? "bg-jupiter-green/20 text-jupiter-green"
                  : "bg-jupiter-red/20 text-jupiter-red"
              )}
            >
              {side}
            </span>
            <span className="text-xs text-jupiter-muted">
              {Number(position.contracts).toLocaleString()} contracts
            </span>
          </div>
        </div>

        <div className="text-right ml-4">
          <div className={cn("text-lg font-bold", getPnlColor(pnl))}>
            {getPnlSign(pnl)}${Math.abs(pnl).toFixed(2)}
          </div>
          <div className={cn("text-xs", getPnlColor(pnlPercent))}>
            {getPnlSign(pnlPercent)}{Math.abs(pnlPercent).toFixed(1)}%
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
        <div className="rounded-lg bg-jupiter-input p-2">
          <div className="text-jupiter-muted">Avg Price</div>
          <div className="font-mono font-medium">
            {position.avgPriceUsd ? microToCents(position.avgPriceUsd) : "—"}
          </div>
        </div>
        <div className="rounded-lg bg-jupiter-input p-2">
          <div className="text-jupiter-muted">Cost</div>
          <div className="font-mono font-medium">${cost.toFixed(2)}</div>
        </div>
        <div className="rounded-lg bg-jupiter-input p-2">
          <div className="text-jupiter-muted">Value</div>
          <div className="font-mono font-medium">${currentVal.toFixed(2)}</div>
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        {position.claimable && (
          <button
            onClick={handleClaim}
            disabled={!!loading}
            className="flex-1 rounded-lg bg-jupiter-accent py-2 text-xs font-bold text-jupiter-bg hover:brightness-110 disabled:opacity-50 transition-all"
          >
            {loading === "claim" ? "Claiming..." : `Claim $${microToUsd(position.payoutUsd || 0).toFixed(2)}`}
          </button>
        )}
        {position.marketMetadata?.status === "open" && !position.claimable && (
          <button
            onClick={handleClose}
            disabled={!!loading}
            className="flex-1 rounded-lg border border-jupiter-border py-2 text-xs font-medium text-jupiter-muted hover:border-jupiter-red hover:text-jupiter-red disabled:opacity-50 transition-all"
          >
            {loading === "close" ? "Closing..." : "Close Position"}
          </button>
        )}
      </div>
    </div>
  );
}
