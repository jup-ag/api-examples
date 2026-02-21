"use client";

import { useQuery, useInfiniteQuery, keepPreviousData } from "@tanstack/react-query";
import { getEventsPaginated, getEvent, searchEvents, getSuggestedEvents } from "@/lib/api";
import { PAGE_SIZE, SORT_OPTIONS } from "@/lib/constants";
import type { Category, Filter, SortOptionValue } from "@/lib/constants";

export function useEvents(params?: {
  category?: Category;
  filter?: Filter;
  sortOption?: SortOptionValue;
  subcategory?: string;
}) {
  const sort = SORT_OPTIONS.find((o) => o.value === params?.sortOption) ?? SORT_OPTIONS[0];

  return useInfiniteQuery({
    queryKey: ["events", params],
    queryFn: ({ pageParam = 0 }) =>
      getEventsPaginated({
        category: params?.category === "all" ? undefined : params?.category,
        subcategory: params?.subcategory,
        filter: params?.filter,
        sortBy: sort.sortBy,
        sortDirection: sort.sortDirection,
        includeMarkets: true,
        start: pageParam,
        end: pageParam + PAGE_SIZE,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasNext ? lastPage.pagination.end : undefined,
    placeholderData: keepPreviousData,
  });
}

export function useEvent(eventId: string) {
  return useQuery({
    queryKey: ["event", eventId],
    queryFn: () => getEvent(eventId, true),
    enabled: !!eventId,
  });
}

export function useSearchEvents(query: string) {
  return useQuery({
    queryKey: ["events", "search", query],
    queryFn: () => searchEvents(query, { limit: 20 }),
    enabled: query.length >= 2,
  });
}

export function useSuggestedEvents(pubkey: string | undefined) {
  return useQuery({
    queryKey: ["events", "suggested", pubkey],
    queryFn: () => getSuggestedEvents(pubkey!),
    enabled: !!pubkey,
  });
}
