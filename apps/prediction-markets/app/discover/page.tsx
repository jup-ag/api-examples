"use client";

import { useState, useRef, useMemo, useEffect, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Search, Loader2, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { EventCard } from "@/components/event-card";
import { EndpointBadge } from "@/components/endpoint-badge";
import { SkeletonList } from "@/components/skeleton-list";
import { useEvents, useSearchEvents, useSuggestedEvents } from "@/hooks/use-events";
import { cn } from "@/lib/utils";
import { CATEGORIES, FILTERS, SORT_OPTIONS } from "@/lib/constants";
import type { Category, Filter, SortOptionValue } from "@/lib/constants";

export default function DiscoverPage() {
  const [category, setCategory] = useState<Category>("all");
  const [filter, setFilter] = useState<Filter | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [sortOption, setSortOption] = useState<SortOptionValue>("default");
  const [subcategory, setSubcategory] = useState<string | undefined>();

  const { publicKey } = useWallet();
  const {
    data,
    isLoading,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useEvents({ category, filter, sortOption, subcategory });

  const hasLoadedOnce = useRef(false);
  if (data) hasLoadedOnce.current = true;
  const showSkeleton = isLoading && !hasLoadedOnce.current;

  const events = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data]
  );

  const { data: searchResults } = useSearchEvents(debouncedQuery);
  const { data: suggested } = useSuggestedEvents(publicKey?.toBase58());

  const debounceTimeout = useMemo(() => {
    let timer: NodeJS.Timeout;
    return (value: string) => {
      clearTimeout(timer);
      timer = setTimeout(() => setDebouncedQuery(value), 300);
    };
  }, []);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    debounceTimeout(value);
  };

  // Reset subcategory when category changes
  useEffect(() => {
    setSubcategory(undefined);
  }, [category]);

  // Extract subcategories from loaded events, persisted in ref so they don't
  // disappear when a subcategory filter narrows the result set.
  const subcategoriesRef = useRef<string[]>([]);
  const subcategories = useMemo(() => {
    if (category === "all") return [];
    const fromEvents = Array.from(
      new Set(events.map((e) => e.subcategory).filter(Boolean))
    ).sort();
    if (fromEvents.length > 0) subcategoriesRef.current = fromEvents;
    return subcategoriesRef.current;
  }, [events, category]);

  // Clear cached subcategories when category changes
  useEffect(() => {
    subcategoriesRef.current = [];
  }, [category]);

  const isSearching = debouncedQuery.length >= 2;
  const displayEvents = isSearching ? searchResults : events;

  // Infinite scroll sentinel
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const sentinelCallback = useCallback(
    (node: HTMLDivElement | null) => {
      if (observerRef.current) observerRef.current.disconnect();
      if (!node) return;
      sentinelRef.current = node;
      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        },
        { rootMargin: "200px" }
      );
      observerRef.current.observe(node);
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Discover Events</h1>
        <p className="text-sm text-muted-foreground">Explore prediction markets across categories</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="relative">
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as SortOptionValue)}
            className="h-9 appearance-none rounded-md border border-input bg-transparent py-2 pr-8 pl-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50" />
        </div>
        <EndpointBadge number={2} method="GET" path="/events/search" description="Search events by keyword query" />
      </div>

      <ToggleGroup
        type="single"
        variant="outline"
        value={category}
        onValueChange={(val) => { if (val) setCategory(val as Category); }}
        className="flex-wrap justify-start"
      >
        {CATEGORIES.map((cat) => (
          <ToggleGroupItem key={cat} value={cat} className="capitalize">
            {cat}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <Badge
            key={f}
            variant={filter === f ? "default" : "outline"}
            className="cursor-pointer capitalize"
            onClick={() => setFilter(filter === f ? undefined : f)}
          >
            {f}
          </Badge>
        ))}
      </div>

      {subcategories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {subcategories.map((sub) => (
            <Badge
              key={sub}
              variant={subcategory === sub ? "default" : "secondary"}
              className="cursor-pointer capitalize"
              onClick={() => setSubcategory(subcategory === sub ? undefined : sub)}
            >
              {sub}
            </Badge>
          ))}
        </div>
      )}

      {suggested && suggested.length > 0 && !debouncedQuery && category === "all" && !filter && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">Suggested for You</h2>
            <EndpointBadge number={3} method="GET" path="/events/suggested/{pubkey}" description="Get personalized event suggestions based on wallet activity" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {suggested.map((event) => (
              <EventCard key={event.eventId} event={event} />
            ))}
          </div>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <EndpointBadge number={1} method="GET" path="/events" description="Fetch all prediction events with category and filter options" />
        </div>
        {showSkeleton ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <SkeletonList count={8} className="h-64 rounded-lg" />
          </div>
        ) : (
          <>
            <div className={cn(
              "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 transition-opacity",
              isFetching && !isFetchingNextPage && "opacity-50"
            )}>
              {displayEvents?.map((event) => (
                <EventCard key={event.eventId} event={event} />
              ))}
              {!isFetching && displayEvents?.length === 0 && (
                <p className="col-span-full py-12 text-center text-muted-foreground">No events found</p>
              )}
            </div>

            {!isSearching && (
              <div className="flex justify-center py-4">
                {hasNextPage ? (
                  <div ref={sentinelCallback}>
                    {isFetchingNextPage && (
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    )}
                  </div>
                ) : (
                  events.length > 0 && (
                    <p className="text-sm text-muted-foreground">All events loaded</p>
                  )
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
