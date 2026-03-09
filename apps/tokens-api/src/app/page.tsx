"use client";

import { useEffect, useState, useCallback, useRef } from "react";

// ---------------------------------------------------------------------------
// Types — mirrors the Jupiter Tokens API v2 response shape
// Docs: https://dev.jup.ag/guides/how-to-get-token-information
// ---------------------------------------------------------------------------

interface TokenInfo {
  id: string;
  name: string;
  symbol: string;
  icon: string | null;
  decimals: number;
  isVerified: boolean | null;
  organicScore: number;
  organicScoreLabel: "high" | "medium" | "low";
  usdPrice: number | null;
  mcap: number | null;
  fdv: number | null;
  holderCount: number | null;
  liquidity: number | null;
  circSupply: number | null;
  tags: string[] | null;
  audit: {
    isSus?: boolean;
    mintAuthorityDisabled?: boolean;
    freezeAuthorityDisabled?: boolean;
    topHoldersPercentage?: number;
    devBalancePercentage?: number;
    devMints?: number;
  } | null;
}

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

function fmt(n: number | null | undefined): string {
  if (n == null) return "\u2014";
  if (n >= 1e9) return "$" + (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return "$" + (n / 1e6).toFixed(2) + "M";
  if (n >= 1e3) return "$" + (n / 1e3).toFixed(1) + "K";
  return "$" + n.toFixed(2);
}

function fmtCount(n: number | null | undefined): string {
  if (n == null) return "\u2014";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return n.toLocaleString();
}

function fmtPrice(n: number | null | undefined): string {
  if (n == null) return "\u2014";
  if (n < 0.01) return "$" + n.toPrecision(3);
  return "$" + n.toFixed(2);
}

function truncAddr(addr: string): string {
  return addr.slice(0, 4) + "..." + addr.slice(-4);
}

// ---------------------------------------------------------------------------
// UI Components
// ---------------------------------------------------------------------------

function ScoreBadge({ score }: { score: number | null }) {
  if (score == null) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-50 text-yellow-800">
        N/A
      </span>
    );
  }
  const s = Math.floor(score);
  if (s > 80) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
        {s}
      </span>
    );
  }
  if (s > 50) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-50 text-yellow-800">
        {s}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800">
      {s}
    </span>
  );
}

function AuditRow({
  label,
  value,
  status,
}: {
  label: string;
  value: string;
  status: "safe" | "warn" | "danger";
}) {
  const color =
    status === "safe"
      ? "text-green-600"
      : status === "warn"
        ? "text-orange-600"
        : "text-red-600";

  return (
    <div className="flex justify-between items-center px-3.5 py-2.5 bg-gray-50 rounded-[10px]">
      <span className="text-[13px] text-gray-500 font-medium">{label}</span>
      <span className={`text-[13px] font-semibold ${color}`}>{value}</span>
    </div>
  );
}

function TokenCard({
  token,
  animDelay,
  isNew,
}: {
  token: TokenInfo;
  animDelay?: number;
  isNew?: boolean;
}) {
  const [flipped, setFlipped] = useState(false);
  const audit = token.audit || {};

  return (
    <div
      className={`card-container ${flipped ? "flipped" : ""} ${isNew ? "animate-card-in" : ""}`}
      style={animDelay ? { animationDelay: `${animDelay}s` } : undefined}
      onClick={() => setFlipped((f) => !f)}
    >
      <div className="card-inner">
        {/* Front face — market data */}
        <div className="card-front">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3.5 min-w-0">
              {token.icon ? (
                <img
                  src={token.icon}
                  alt=""
                  className="w-12 h-12 rounded-full object-cover bg-gray-100 shrink-0"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    e.currentTarget.nextElementSibling?.classList.remove(
                      "hidden",
                    );
                  }}
                />
              ) : null}
              <div
                className={`w-12 h-12 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center font-bold text-lg text-indigo-500 shrink-0 ${token.icon ? "hidden" : ""}`}
              >
                {token.symbol?.[0] || "?"}
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-base truncate flex items-center gap-1.5">
                  {token.name}
                </div>
                <div className="text-[13px] text-gray-500 font-medium">
                  {token.symbol}
                  {token.isVerified ? " \u00B7 Verified" : ""}
                </div>
              </div>
            </div>
            <div className="shrink-0">
              <ScoreBadge score={token.organicScore} />
            </div>
          </div>

          <div
            className="text-[11px] text-gray-400 font-mono bg-gray-100 px-2 py-1 rounded-md truncate"
            title={token.id}
          >
            {token.id}
          </div>

          <div className="grid grid-cols-3 gap-1.5 mt-auto">
            <div className="bg-gray-50 rounded-[10px] px-2.5 py-2">
              <div className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">
                Market Cap
              </div>
              <div className="text-[15px] font-semibold mt-0.5">
                {fmt(token.mcap)}
              </div>
            </div>
            <div className="bg-gray-50 rounded-[10px] px-2.5 py-2">
              <div className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">
                Holders
              </div>
              <div className="text-[15px] font-semibold mt-0.5">
                {fmtCount(token.holderCount)}
              </div>
            </div>
            <div className="bg-gray-50 rounded-[10px] px-2.5 py-2">
              <div className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">
                Price
              </div>
              <div className="text-[15px] font-semibold mt-0.5">
                {fmtPrice(token.usdPrice)}
              </div>
            </div>
            <div className="bg-gray-50 rounded-[10px] px-2.5 py-2">
              <div className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">
                Liquidity
              </div>
              <div className="text-[15px] font-semibold mt-0.5">
                {fmt(token.liquidity)}
              </div>
            </div>
            <div className="bg-gray-50 rounded-[10px] px-2.5 py-2">
              <div className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">
                FDV
              </div>
              <div className="text-[15px] font-semibold mt-0.5">
                {fmt(token.fdv)}
              </div>
            </div>
            <div className="bg-gray-50 rounded-[10px] px-2.5 py-2">
              <div className="text-[11px] text-gray-400 uppercase tracking-wider font-semibold">
                Supply
              </div>
              <div className="text-[15px] font-semibold mt-0.5">
                {fmtCount(token.circSupply)}
              </div>
            </div>
          </div>
        </div>

        {/* Back face — audit info */}
        <div className="card-back">
          <div className="text-[15px] font-bold text-gray-500 uppercase tracking-wider mb-1">
            Audit Info
          </div>
          <AuditRow
            label="Mint Authority"
            value={
              audit.mintAuthorityDisabled
                ? "Renounced"
                : audit.mintAuthorityDisabled === false
                  ? "Active"
                  : "Unknown"
            }
            status={audit.mintAuthorityDisabled ? "safe" : "warn"}
          />
          <AuditRow
            label="Freeze Authority"
            value={
              audit.freezeAuthorityDisabled
                ? "None"
                : audit.freezeAuthorityDisabled === false
                  ? "Present"
                  : "Unknown"
            }
            status={audit.freezeAuthorityDisabled ? "safe" : "warn"}
          />
          <AuditRow
            label="Top Holder Conc."
            value={
              audit.topHoldersPercentage != null
                ? audit.topHoldersPercentage.toFixed(1) + "%"
                : "\u2014"
            }
            status={
              audit.topHoldersPercentage != null &&
              audit.topHoldersPercentage < 20
                ? "safe"
                : audit.topHoldersPercentage != null &&
                    audit.topHoldersPercentage < 50
                  ? "warn"
                  : audit.topHoldersPercentage != null
                    ? "danger"
                    : "warn"
            }
          />
          <AuditRow
            label="Suspicious Flag"
            value={audit.isSus === true ? "Yes" : "No"}
            status={audit.isSus ? "danger" : "safe"}
          />
          <AuditRow
            label="Dev Balance"
            value={
              audit.devBalancePercentage != null
                ? audit.devBalancePercentage.toFixed(1) + "%"
                : "\u2014"
            }
            status={
              audit.devBalancePercentage != null &&
              audit.devBalancePercentage > 5
                ? "warn"
                : "safe"
            }
          />
          <AuditRow
            label="Dev Mints"
            value={audit.devMints != null ? String(audit.devMints) : "\u2014"}
            status={
              audit.devMints != null && audit.devMints > 0 ? "warn" : "safe"
            }
          />
          <div className="mt-auto text-center text-xs text-gray-300">
            Click to flip back
          </div>
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="card-container">
      <div className="card-inner">
        <div className="card-front animate-pulse">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-gray-200" />
            <div className="space-y-2">
              <div className="h-4 w-24 bg-gray-200 rounded" />
              <div className="h-3 w-16 bg-gray-200 rounded" />
            </div>
          </div>
          <div className="h-6 w-full bg-gray-100 rounded-md" />
          <div className="grid grid-cols-3 gap-1.5 mt-auto">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-14 bg-gray-50 rounded-[10px]" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Explorer — main page component
// ---------------------------------------------------------------------------

export default function Explorer() {
  const [recentTokens, setRecentTokens] = useState<TokenInfo[]>([]);
  const [searchResults, setSearchResults] = useState<TokenInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [isSearchActive, setIsSearchActive] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const knownIdsRef = useRef<Set<string>>(new Set());
  const refreshRef = useRef<ReturnType<typeof setInterval>>(null);
  const initialLoadRef = useRef(true);

  // Fetch from our API route (proxies Jupiter Tokens API v2)
  const fetchTokens = useCallback(
    async (endpoint: string, searchQuery?: string) => {
      const params = new URLSearchParams({ endpoint });
      if (searchQuery) params.set("query", searchQuery);

      const res = await fetch(`/api/tokens?${params}`);
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      return Array.isArray(data) ? (data as TokenInfo[]) : [];
    },
    [],
  );

  // Load recent tokens
  const loadRecent = useCallback(
    async (isRefresh: boolean) => {
      try {
        const tokens = await fetchTokens("recent");

        if (!isRefresh) {
          knownIdsRef.current = new Set(tokens.map((t) => t.id));
          setRecentTokens(tokens);
          setLoading(false);
          initialLoadRef.current = false;
          return;
        }

        // Find new tokens not in current set
        const newTokens = tokens.filter(
          (t) => !knownIdsRef.current.has(t.id),
        );
        if (newTokens.length === 0) return;

        newTokens.forEach((t) => knownIdsRef.current.add(t.id));
        setRecentTokens((prev) => [...newTokens.reverse(), ...prev].slice(0, 30));
      } catch (e) {
        if (!isRefresh) {
          setError(
            e instanceof Error ? e.message : "Failed to load recent tokens",
          );
          setLoading(false);
        }
        console.error("Recent error:", e);
      }
    },
    [fetchTokens],
  );

  // Start/stop auto-refresh
  const startRefresh = useCallback(() => {
    if (refreshRef.current) return;
    refreshRef.current = setInterval(() => loadRecent(true), 1000);
  }, [loadRecent]);

  const stopRefresh = useCallback(() => {
    if (refreshRef.current) {
      clearInterval(refreshRef.current);
      refreshRef.current = null;
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadRecent(false).then(startRefresh);
    return stopRefresh;
  }, [loadRecent, startRefresh, stopRefresh]);

  // Search
  const handleSearch = useCallback(
    (value: string) => {
      setQuery(value);

      if (debounceRef.current) clearTimeout(debounceRef.current);

      if (!value.trim()) {
        setIsSearchActive(false);
        setSearchResults([]);
        startRefresh();
        return;
      }

      stopRefresh();
      setIsSearchActive(true);

      debounceRef.current = setTimeout(async () => {
        setSearching(true);
        try {
          const results = await fetchTokens("search", value);
          setSearchResults(results);
        } catch (e) {
          console.error("Search error:", e);
          setSearchResults([]);
        } finally {
          setSearching(false);
        }
      }, 350);
    },
    [fetchTokens, startRefresh, stopRefresh],
  );

  return (
    <div className="max-w-[1200px] mx-auto">
      {/* Header */}
      <h1 className="text-[32px] font-bold text-center mb-2 tracking-tight">
        Jupiter Token Gallery
      </h1>
      <p className="text-center text-gray-500 text-[15px] mb-8">
        Search Solana tokens powered by the Jupiter Tokens API
      </p>

      {/* Search */}
      <div className="search-wrap" style={{ maxWidth: 560, margin: "0 auto 40px" }}>
        <svg
          width="20"
          height="20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search by token name, symbol, or mint address..."
          autoComplete="off"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="text-center text-gray-400 py-12 text-[15px]">
          {error}
        </div>
      )}

      {/* Recently Listed */}
      {!isSearchActive && (
        <div>
          <div className="text-xl font-semibold mb-4 flex items-center gap-2">
            Recently Listed
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))
              : recentTokens.map((token, i) => (
                  <TokenCard
                    key={token.id}
                    token={token}
                    animDelay={initialLoadRef.current ? i * 0.04 : undefined}
                    isNew={true}
                  />
                ))}
          </div>
        </div>
      )}

      {/* Search Results */}
      {isSearchActive && (
        <div>
          <div className="text-xl font-semibold mb-4 flex items-center gap-2">
            Search Results
          </div>
          {searching ? (
            <div className="text-center text-gray-400 py-12 text-[15px]">
              Searching...
            </div>
          ) : searchResults.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
              {searchResults.map((token) => (
                <TokenCard key={token.id} token={token} />
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-400 py-12 text-[15px]">
              No tokens found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
