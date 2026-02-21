"use client";

import { useQuery } from "@tanstack/react-query";
import { getHistory } from "@/lib/api";

export function useHistory(ownerPubkey?: string) {
  return useQuery({
    queryKey: ["history", ownerPubkey],
    queryFn: () => getHistory({ ownerPubkey }),
    enabled: !!ownerPubkey,
  });
}
