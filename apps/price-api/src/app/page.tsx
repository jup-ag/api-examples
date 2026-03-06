"use client";

import { useEffect, useState, useCallback, useRef } from "react";

// ---------------------------------------------------------------------------
// Token metadata — maps mint addresses to human-readable names
// ---------------------------------------------------------------------------

const TOKEN_META: Record<string, { symbol: string; name: string }> = {
  So11111111111111111111111111111111111111112: {
    symbol: "SOL",
    name: "Solana",
  },
  JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN: {
    symbol: "JUP",
    name: "Jupiter",
  },
  EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v: {
    symbol: "USDC",
    name: "USD Coin",
  },
};

// Display order for the token cards
const MINT_ORDER = [
  "So11111111111111111111111111111111111111112",
  "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
];

// How often to poll the API (in seconds)
const REFRESH_INTERVAL = 10;

// ---------------------------------------------------------------------------
// Types — mirrors the Jupiter Price API v3 response shape
// Docs: https://dev.jup.ag/docs/price/v3
// ---------------------------------------------------------------------------

interface TokenPrice {
  usdPrice: number; // Current USD price
  liquidity: number; // Total USD liquidity across pools
  blockId: number; // Solana block ID when price was computed
  decimals: number; // Token decimal places
  createdAt: string; // ISO timestamp of token creation
  priceChange24h: number; // 24-hour percentage change
}

type PriceData = Record<string, TokenPrice>;

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

function formatUsd(value: number): string {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: value >= 1 ? 2 : 6,
  });
}

function formatLiquidity(value: number): string {
  if (value >= 1_000_000_000)
    return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(2)}K`;
  return `$${value.toFixed(2)}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ---------------------------------------------------------------------------
// UI Components
// ---------------------------------------------------------------------------

/** Circular countdown ring that shows time until next API refresh */
function CountdownTimer({
  seconds,
  total,
}: {
  seconds: number;
  total: number;
}) {
  const radius = 14;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - seconds / total);

  return (
    <div className="flex items-center gap-2">
      <svg width="36" height="36" className="-rotate-90">
        <circle
          cx="18"
          cy="18"
          r={radius}
          fill="none"
          stroke="#1e2a3a"
          strokeWidth="3"
        />
        <circle
          cx="18"
          cy="18"
          r={radius}
          fill="none"
          stroke={seconds <= 3 ? "#ff5252" : "#00d4aa"}
          strokeWidth="3"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="countdown-ring"
        />
      </svg>
      <span className="text-sm text-slate-400 tabular-nums font-mono">
        {seconds}s
      </span>
    </div>
  );
}

/** Green/red arrow with percentage — used for 24h price change */
function PriceChangeIndicator({ change }: { change: number }) {
  const isUp = change >= 0;
  return (
    <span
      className={`${isUp ? "text-price-up" : "text-price-down"} font-semibold`}
    >
      {isUp ? "\u25B2" : "\u25BC"} {Math.abs(change).toFixed(2)}%
    </span>
  );
}

/** Displays a single label/value pair in the token card data grid */
function DataField({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="bg-jupiter-dark/50 rounded-lg px-3 py-2">
      <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-0.5">
        {label}
      </p>
      <div className="text-sm text-slate-200 font-medium">{value}</div>
    </div>
  );
}

/** Card that displays all fields returned by the Jupiter Price API for a token */
function TokenCard({
  mint,
  data,
  prevPrice,
}: {
  mint: string;
  data: TokenPrice;
  prevPrice: number | null;
}) {
  const meta = TOKEN_META[mint];

  // Flash green/red border when the price changes between refreshes
  const priceFlash =
    prevPrice === null
      ? ""
      : data.usdPrice > prevPrice
        ? "ring-2 ring-price-up/40"
        : data.usdPrice < prevPrice
          ? "ring-2 ring-price-down/40"
          : "";

  return (
    <div
      className={`bg-jupiter-card border border-jupiter-border rounded-2xl p-6 transition-all duration-500 hover:border-jupiter-green/50 ${priceFlash}`}
    >
      {/* Token header — icon, name, and 24h change badge */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-jupiter-green to-jupiter-teal flex items-center justify-center text-sm font-bold text-jupiter-dark">
            {meta.symbol[0]}
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{meta.symbol}</h2>
            <p className="text-xs text-slate-500">{meta.name}</p>
          </div>
        </div>
        <PriceChangeIndicator change={data.priceChange24h} />
      </div>

      {/* Main price display */}
      <div className="mb-5">
        <p className="text-3xl font-bold text-white tabular-nums">
          {formatUsd(data.usdPrice)}
        </p>
        <p className="text-xs text-slate-500 mt-1">USD Price</p>
      </div>

      {/* All remaining API fields displayed in a grid */}
      <div className="grid grid-cols-2 gap-4">
        <DataField label="Liquidity" value={formatLiquidity(data.liquidity)} />
        <DataField
          label="24h Change"
          value={<PriceChangeIndicator change={data.priceChange24h} />}
        />
        <DataField label="Decimals" value={data.decimals.toString()} />
        <DataField label="Block ID" value={data.blockId.toLocaleString()} />
        <DataField label="Created" value={formatDate(data.createdAt)} />
        <DataField
          label="Mint"
          value={
            <span className="text-[10px] break-all leading-tight">
              {mint.slice(0, 8)}...{mint.slice(-6)}
            </span>
          }
        />
      </div>
    </div>
  );
}

/** Placeholder shown while waiting for the first API response */
function SkeletonCard() {
  return (
    <div className="bg-jupiter-card border border-jupiter-border rounded-2xl p-6 animate-pulse">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-full bg-jupiter-border" />
        <div className="space-y-2">
          <div className="h-4 w-16 bg-jupiter-border rounded" />
          <div className="h-3 w-20 bg-jupiter-border rounded" />
        </div>
      </div>
      <div className="h-8 w-32 bg-jupiter-border rounded mb-5" />
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-12 bg-jupiter-dark/50 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dashboard — main page component
// ---------------------------------------------------------------------------

export default function Dashboard() {
  const [prices, setPrices] = useState<PriceData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const prevPrices = useRef<PriceData | null>(null);

  // Fetch prices from our API route (which proxies Jupiter Price API v3)
  const fetchPrices = useCallback(async () => {
    try {
      const res = await fetch("/api/prices");
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || `HTTP ${res.status}`);
      }
      const data = await res.json();

      // Store previous prices so we can flash green/red on change
      prevPrices.current = prices;
      setPrices(data);
      setError(null);
      setLastUpdated(new Date());
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to fetch";
      setError(message);
    }
    setCountdown(REFRESH_INTERVAL);
  }, [prices]);

  // Fetch on mount
  useEffect(() => {
    fetchPrices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Countdown timer — triggers a new fetch every REFRESH_INTERVAL seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchPrices();
          return REFRESH_INTERVAL;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [fetchPrices]);

  return (
    <div className="min-h-screen px-4 py-8 max-w-6xl mx-auto">
      {/* Header */}
      <header className="mb-10">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-jupiter-green to-jupiter-teal flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                className="w-5 h-5 text-jupiter-dark"
                fill="currentColor"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                Jupiter{" "}
                <span className="bg-gradient-to-r from-jupiter-green to-jupiter-teal bg-clip-text text-transparent">
                  Price Dashboard
                </span>
              </h1>
              <p className="text-xs text-slate-500">
                Powered by Jupiter Price API v3
              </p>
            </div>
          </div>

          {/* Status bar — last updated time, countdown, connection indicator */}
          <div className="flex items-center gap-5">
            {lastUpdated && (
              <p className="text-xs text-slate-500">
                Updated {lastUpdated.toLocaleTimeString()}
              </p>
            )}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Next refresh</span>
              <CountdownTimer seconds={countdown} total={REFRESH_INTERVAL} />
            </div>
            <div
              className={`w-2 h-2 rounded-full ${
                error
                  ? "bg-price-down animate-pulse-glow"
                  : "bg-price-up animate-pulse-glow"
              }`}
              title={error ? "Error" : "Connected"}
            />
          </div>
        </div>
      </header>

      {/* Error banner */}
      {error && (
        <div className="mb-6 bg-price-down/10 border border-price-down/30 rounded-xl px-4 py-3 text-price-down text-sm">
          {error}
        </div>
      )}

      {/* Token price cards — one per token, or skeletons while loading */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {prices
          ? MINT_ORDER.map((mint) => {
              const data = prices[mint];
              if (!data) return null;
              const prev = prevPrices.current?.[mint]?.usdPrice ?? null;
              return (
                <TokenCard
                  key={mint}
                  mint={mint}
                  data={data}
                  prevPrice={prev}
                />
              );
            })
          : MINT_ORDER.map((mint) => <SkeletonCard key={mint} />)}
      </div>

      {/* Footer */}
      <footer className="mt-12 text-center text-xs text-slate-600">
        Data from{" "}
        <a
          href="https://dev.jup.ag/docs/price/v3"
          target="_blank"
          rel="noopener noreferrer"
          className="text-jupiter-green hover:underline"
        >
          Jupiter Price API v3
        </a>{" "}
        &middot; Auto-refreshes every {REFRESH_INTERVAL}s
      </footer>
    </div>
  );
}
