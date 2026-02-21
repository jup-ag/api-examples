"use client";

import { useQuery } from "@tanstack/react-query";
import { getProfile, getPnlHistory } from "@/lib/api";

export function useProfile(ownerPubkey?: string) {
  return useQuery({
    queryKey: ["profile", ownerPubkey],
    queryFn: () => getProfile(ownerPubkey!),
    enabled: !!ownerPubkey,
  });
}

export function usePnlHistory(ownerPubkey?: string, interval?: string, count?: number) {
  return useQuery({
    queryKey: ["pnl-history", ownerPubkey, interval, count],
    queryFn: () => getPnlHistory(ownerPubkey!, { interval, count }),
    enabled: !!ownerPubkey,
  });
}
