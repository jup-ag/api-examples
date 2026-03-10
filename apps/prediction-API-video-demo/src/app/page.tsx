"use client";

import { useState, useCallback, useRef } from "react";
import { getEvents, searchEvents } from "@/lib/jupiter";
import { useAutoRefresh } from "@/lib/hooks";
import EventCard from "@/components/EventCard";
import Spinner from "@/components/Spinner";

const PAGE_SIZE = 20;

const CATEGORIES = [
  { label: "ALL", value: "" },
  { label: "EPL", value: "epl" },
  { label: "UCL", value: "ucl" },
  { label: "NBA", value: "nba" },
  { label: "UFC", value: "ufc" },
  { label: "ATP", value: "atp" },
  { label: "WTA", value: "wta" },
  { label: "LA LIGA", value: "lal" },
  { label: "SERIE A", value: "sea" },
];

export default function MarketsPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("");
  const [allEvents, setAllEvents] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const pageRef = useRef(0);

  const fetcher = useCallback(async () => {
    if (search.trim()) {
      const res = await searchEvents(search.trim(), PAGE_SIZE);
      setAllEvents(res.data || []);
      setHasMore(res.pagination?.hasNext || false);
      setTotal(res.pagination?.total || 0);
      pageRef.current = PAGE_SIZE;
      return res;
    }
    const res = await getEvents({
      category: "sports",
      subcategory: activeCategory || undefined,
      start: 0,
      end: PAGE_SIZE,
    });
    setAllEvents(res.data || []);
    setHasMore(res.pagination?.hasNext || false);
    setTotal(res.pagination?.total || 0);
    pageRef.current = PAGE_SIZE;
    return res;
  }, [search, activeCategory]);

  const { loading, error } = useAutoRefresh(fetcher);

  const loadMore = async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    try {
      const start = pageRef.current;
      const end = start + PAGE_SIZE;
      const res = search.trim()
        ? await searchEvents(search.trim(), end)
        : await getEvents({
            category: "sports",
            subcategory: activeCategory || undefined,
            start,
            end,
          });
      const newEvents = res.data || [];
      setAllEvents((prev) => [...prev, ...newEvents]);
      setHasMore(res.pagination?.hasNext || false);
      pageRef.current = end;
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div>
      {/* Search */}
      <div className="mb-5">
        <div className="relative max-w-md">
          <svg
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-jupiter-muted"
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search markets..."
            className="w-full rounded-xl border border-jupiter-border bg-jupiter-input py-2.5 pl-10 pr-4 text-sm text-jupiter-text placeholder:text-jupiter-muted/50 focus:border-jupiter-accent focus:outline-none"
          />
        </div>
      </div>

      {/* Category tabs */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => {
              setActiveCategory(cat.value);
              setSearch("");
            }}
            className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition-all ${
              activeCategory === cat.value && !search
                ? "bg-jupiter-text text-jupiter-bg"
                : "bg-jupiter-card text-jupiter-muted border border-jupiter-border hover:text-jupiter-text hover:border-jupiter-text/30"
            }`}
          >
            <span className="text-[10px]">⚽</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && allEvents.length === 0 && (
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-jupiter-red/30 bg-jupiter-red/10 p-4 text-center text-sm text-jupiter-red">
          {error}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && allEvents.length === 0 && (
        <div className="rounded-xl border border-jupiter-border bg-jupiter-card p-12 text-center">
          <p className="text-jupiter-muted">No markets found.</p>
          <p className="mt-1 text-xs text-jupiter-muted/70">
            Try a different search or category.
          </p>
        </div>
      )}

      {/* Count */}
      {allEvents.length > 0 && (
        <div className="mb-4 text-xs text-jupiter-muted">
          Showing {allEvents.length} of {total} events
        </div>
      )}

      {/* Event Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {allEvents.map((event: any) => (
          <EventCard key={event.eventId} event={event} />
        ))}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="mt-6 text-center">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="rounded-lg border border-jupiter-border bg-jupiter-card px-6 py-2.5 text-sm font-medium text-jupiter-text hover:bg-jupiter-hover hover:border-jupiter-text/30 disabled:opacity-50 transition-all"
          >
            {loadingMore ? (
              <span className="inline-flex items-center gap-2">
                <Spinner size="sm" />
                Loading...
              </span>
            ) : (
              `Load More (${total - allEvents.length} remaining)`
            )}
          </button>
        </div>
      )}

      {/* Refresh indicator */}
      {!loading && allEvents.length > 0 && (
        <div className="mt-4 text-center text-[11px] text-jupiter-muted/50">
          Auto-refreshes every 30 seconds
        </div>
      )}
    </div>
  );
}
