"use client";

import { useQuery } from "@tanstack/react-query";
import { getEventMarkets, getMarket, getOrderbook, getTradingStatus, getForecast } from "@/lib/api";

export function useEventMarkets(eventId: string) {
  return useQuery({
    queryKey: ["markets", eventId],
    queryFn: () => getEventMarkets(eventId),
    enabled: !!eventId,
  });
}

export function useMarket(marketId: string) {
  return useQuery({
    queryKey: ["market", marketId],
    queryFn: () => getMarket(marketId),
    enabled: !!marketId,
  });
}

export function useOrderbook(marketId: string) {
  return useQuery({
    queryKey: ["orderbook", marketId],
    queryFn: () => getOrderbook(marketId),
    enabled: !!marketId,
    refetchInterval: 10_000,
  });
}

export function useTradingStatus() {
  return useQuery({
    queryKey: ["trading-status"],
    queryFn: getTradingStatus,
    refetchInterval: 30_000,
  });
}

export function useForecast() {
  return useQuery({
    queryKey: ["forecast"],
    queryFn: getForecast,
  });
}
