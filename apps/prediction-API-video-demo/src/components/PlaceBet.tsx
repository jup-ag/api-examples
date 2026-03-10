"use client";

import { useState, useRef, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useConnection } from "@solana/wallet-adapter-react";
import { VersionedTransaction } from "@solana/web3.js";
import { createOrder } from "@/lib/jupiter";
import { usdToMicro, microToUsd, microToCents, cn } from "@/lib/utils";

const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
const JUPUSD_MINT = "JuprjznTrTSp2UFa3ZBUFgwdAmtZCq4MQCwysN55USD";

const TOKENS = [
  {
    id: "usdc",
    name: "USDC",
    mint: USDC_MINT,
    icon: (
      <svg viewBox="0 0 32 32" className="h-full w-full">
        <circle cx="16" cy="16" r="16" fill="#2775CA" />
        <path
          d="M20.4 18.2c0-2.1-1.3-2.8-3.8-3.1-1.8-.3-2.2-.7-2.2-1.5s.6-1.3 1.8-1.3c1.1 0 1.7.4 2 1.3.1.1.2.2.3.2h1.1c.2 0 .3-.1.3-.3-.2-1.2-1.1-2.2-2.5-2.4v-1.5c0-.2-.1-.3-.3-.3h-.9c-.2 0-.3.1-.3.3v1.4c-1.7.2-2.8 1.3-2.8 2.7 0 2 1.2 2.7 3.8 3.1 1.7.3 2.2.8 2.2 1.6s-.8 1.4-1.9 1.4c-1.5 0-2-.6-2.2-1.4 0-.2-.1-.2-.3-.2h-1.1c-.2 0-.3.1-.3.3.2 1.4 1.1 2.3 2.7 2.6v1.5c0 .2.1.3.3.3h.9c.2 0 .3-.1.3-.3v-1.5c1.8-.3 2.9-1.4 2.9-2.9z"
          fill="white"
        />
      </svg>
    ),
  },
  {
    id: "jupusd",
    name: "JupUSD",
    mint: JUPUSD_MINT,
    icon: (
      <svg viewBox="0 0 32 32" className="h-full w-full">
        <circle cx="16" cy="16" r="16" fill="#131722" stroke="#c7f284" strokeWidth="2" />
        <text x="16" y="21" textAnchor="middle" fill="#c7f284" fontSize="13" fontWeight="bold" fontFamily="system-ui">J</text>
      </svg>
    ),
  },
];

interface PlaceBetProps {
  marketId: string;
  yesPriceMicro?: number;
  noPriceMicro?: number;
  onSuccess?: () => void;
}

export default function PlaceBet({ marketId, yesPriceMicro, noPriceMicro, onSuccess }: PlaceBetProps) {
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const [side, setSide] = useState<"yes" | "no">("yes");
  const [amount, setAmount] = useState("");
  const [selectedToken, setSelectedToken] = useState(TOKENS[0]);
  const [tokenDropdownOpen, setTokenDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setTokenDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const priceUsd = side === "yes"
    ? microToUsd(yesPriceMicro || 0)
    : microToUsd(noPriceMicro || 0);
  const priceMicro = side === "yes" ? yesPriceMicro : noPriceMicro;

  const amountNum = Number(amount || 0);
  const contracts = priceUsd > 0 ? amountNum / priceUsd : 0;
  const potentialPayout = contracts * 1;
  const potentialProfit = potentialPayout - amountNum;
  const returnPct = amountNum > 0 ? (potentialProfit / amountNum) * 100 : 0;

  const handlePlaceBet = async () => {
    if (!publicKey || !signTransaction || !amount) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await createOrder({
        ownerPubkey: publicKey.toBase58(),
        marketId,
        isYes: side === "yes",
        isBuy: true,
        depositAmount: usdToMicro(amountNum),
        depositMint: selectedToken.mint,
      });

      if (!res.transaction) {
        throw new Error("No transaction returned from API");
      }

      const txBuf = Buffer.from(res.transaction, "base64");
      const tx = VersionedTransaction.deserialize(txBuf);
      const signed = await signTransaction(tx);
      const sig = await connection.sendRawTransaction(signed.serialize());
      await connection.confirmTransaction(sig, "confirmed");

      setSuccess(`Order placed! Tx: ${sig.slice(0, 8)}...`);
      setAmount("");
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || "Failed to place bet");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-jupiter-border bg-jupiter-card overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <h3 className="text-sm font-semibold text-jupiter-text">Place Bet</h3>
      </div>

      {!publicKey ? (
        <div className="px-4 pb-4">
          <div className="rounded-xl bg-gradient-to-br from-jupiter-input to-jupiter-border/30 p-8 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-jupiter-accent/10">
              <svg className="h-5 w-5 text-jupiter-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-jupiter-text">Connect Wallet</p>
            <p className="mt-1 text-xs text-jupiter-muted">to start trading</p>
          </div>
        </div>
      ) : (
        <>
          {/* Side toggle */}
          <div className="px-4 pb-3">
            <div className="flex rounded-xl bg-jupiter-input p-1">
              <button
                onClick={() => setSide("yes")}
                className={cn(
                  "flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all relative",
                  side === "yes"
                    ? "bg-jupiter-green text-white shadow-lg shadow-jupiter-green/25"
                    : "text-jupiter-muted hover:text-jupiter-green"
                )}
              >
                <span className="relative z-10">
                  Yes
                  {yesPriceMicro ? (
                    <span className={cn("ml-1.5 text-xs", side === "yes" ? "text-white/80" : "text-jupiter-muted")}>
                      {microToCents(yesPriceMicro)}
                    </span>
                  ) : null}
                </span>
              </button>
              <button
                onClick={() => setSide("no")}
                className={cn(
                  "flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all relative",
                  side === "no"
                    ? "bg-jupiter-red text-white shadow-lg shadow-jupiter-red/25"
                    : "text-jupiter-muted hover:text-jupiter-red"
                )}
              >
                <span className="relative z-10">
                  No
                  {noPriceMicro ? (
                    <span className={cn("ml-1.5 text-xs", side === "no" ? "text-white/80" : "text-jupiter-muted")}>
                      {microToCents(noPriceMicro)}
                    </span>
                  ) : null}
                </span>
              </button>
            </div>
          </div>

          {/* Amount + Token selector */}
          <div className="px-4 pb-3">
            <label className="mb-1.5 flex items-center justify-between text-xs">
              <span className="text-jupiter-muted">You pay</span>
            </label>
            <div className="rounded-xl border border-jupiter-border bg-jupiter-input p-3 focus-within:border-jupiter-accent transition-colors">
              <div className="flex items-center gap-2">
                <span className="text-jupiter-muted text-lg">$</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="flex-1 bg-transparent text-lg font-semibold text-white placeholder:text-jupiter-muted/40 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />

                {/* Token selector */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setTokenDropdownOpen(!tokenDropdownOpen)}
                    className="flex items-center gap-1.5 rounded-lg bg-jupiter-border/60 px-2.5 py-1.5 text-xs font-semibold text-jupiter-text hover:bg-jupiter-border transition-colors"
                  >
                    <div className="h-4 w-4 flex-shrink-0 rounded-full overflow-hidden">
                      {selectedToken.icon}
                    </div>
                    {selectedToken.name}
                    <svg className={cn("h-3 w-3 text-jupiter-muted transition-transform", tokenDropdownOpen && "rotate-180")}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {tokenDropdownOpen && (
                    <div className="absolute right-0 top-full z-20 mt-1 w-44 overflow-hidden rounded-xl border border-jupiter-border bg-jupiter-card shadow-xl shadow-black/40">
                      <div className="px-3 py-2 text-[10px] font-medium text-jupiter-muted uppercase tracking-wider">
                        Deposit token
                      </div>
                      {TOKENS.map((token) => (
                        <button
                          key={token.id}
                          onClick={() => {
                            setSelectedToken(token);
                            setTokenDropdownOpen(false);
                          }}
                          className={cn(
                            "flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-jupiter-hover",
                            selectedToken.id === token.id && "bg-jupiter-hover"
                          )}
                        >
                          <div className="h-6 w-6 flex-shrink-0 rounded-full overflow-hidden">
                            {token.icon}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-jupiter-text">{token.name}</div>
                            <div className="text-[10px] text-jupiter-muted font-mono">
                              {token.mint.slice(0, 4)}...{token.mint.slice(-4)}
                            </div>
                          </div>
                          {selectedToken.id === token.id && (
                            <svg className="ml-auto h-4 w-4 text-jupiter-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Quick amounts */}
              <div className="mt-2.5 flex gap-1">
                {[1, 5, 10, 25, 50, 100].map((v) => (
                  <button
                    key={v}
                    onClick={() => setAmount(v.toString())}
                    className={cn(
                      "flex-1 rounded-lg py-1 text-[11px] font-medium transition-colors",
                      Number(amount) === v
                        ? "bg-jupiter-accent/15 text-jupiter-accent"
                        : "bg-jupiter-border/40 text-jupiter-muted hover:bg-jupiter-border hover:text-jupiter-text"
                    )}
                  >
                    ${v}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Summary */}
          {amountNum > 0 && (
            <div className="mx-4 mb-3 rounded-xl bg-jupiter-input/60 p-3">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                <div>
                  <div className="text-jupiter-muted">Contracts</div>
                  <div className="font-mono font-semibold text-jupiter-text">{contracts.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-jupiter-muted">Avg. Price</div>
                  <div className="font-mono font-semibold text-jupiter-text">
                    {priceMicro ? microToCents(priceMicro) : "—"}
                  </div>
                </div>
                <div>
                  <div className="text-jupiter-muted">Potential Payout</div>
                  <div className="font-mono font-semibold text-jupiter-green">${potentialPayout.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-jupiter-muted">Profit / Return</div>
                  <div className="font-mono font-semibold text-jupiter-green">
                    +${potentialProfit.toFixed(2)}
                    <span className="ml-1 text-[10px] text-jupiter-green/70">({returnPct.toFixed(0)}%)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Alerts */}
          {error && (
            <div className="mx-4 mb-3 flex items-start gap-2 rounded-xl bg-jupiter-red/10 border border-jupiter-red/20 p-3 text-xs text-jupiter-red">
              <svg className="h-4 w-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mx-4 mb-3 flex items-start gap-2 rounded-xl bg-jupiter-green/10 border border-jupiter-green/20 p-3 text-xs text-jupiter-green">
              <svg className="h-4 w-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>{success}</span>
            </div>
          )}

          {/* Submit button */}
          <div className="p-4 pt-0">
            <button
              onClick={handlePlaceBet}
              disabled={loading || amountNum <= 0}
              className={cn(
                "w-full rounded-xl py-3.5 text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed",
                side === "yes"
                  ? "bg-gradient-to-r from-jupiter-green to-emerald-500 text-white hover:brightness-110 shadow-lg shadow-jupiter-green/20"
                  : "bg-gradient-to-r from-jupiter-red to-rose-500 text-white hover:brightness-110 shadow-lg shadow-jupiter-red/20"
              )}
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing & Confirming...
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  Buy {side === "yes" ? "Yes" : "No"}
                  {amountNum > 0 && (
                    <span className="rounded-md bg-white/15 px-2 py-0.5 text-xs">
                      ${amount} {selectedToken.name}
                    </span>
                  )}
                </span>
              )}
            </button>

            {/* Deposit token note */}
            <div className="mt-2 text-center text-[10px] text-jupiter-muted">
              Depositing with {selectedToken.name} &middot; No withdrawal fees
            </div>
          </div>
        </>
      )}
    </div>
  );
}
