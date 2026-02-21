"use client";

import { useQuery } from "@tanstack/react-query";
import { getLeaderboards, getTrades, getVaultInfo } from "@/lib/api";

export function useLeaderboards(params?: { period?: string; limit?: number; metric?: string }) {
  return useQuery({
    queryKey: ["leaderboards", params],
    queryFn: () => getLeaderboards(params),
  });
}

export function useTrades() {
  return useQuery({
    queryKey: ["trades"],
    queryFn: getTrades,
    refetchInterval: 15_000,
  });
}

export function useVaultInfo() {
  return useQuery({
    queryKey: ["vault-info"],
    queryFn: getVaultInfo,
  });
}
