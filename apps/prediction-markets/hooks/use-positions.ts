"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useWallet } from "@solana/wallet-adapter-react";
import { getPositions, getPosition, closePosition, closeAllPositions, claimPosition, type Position } from "@/lib/api";
import { signAndSend } from "@/lib/send-transaction";
import { toast } from "sonner";

export function usePositions(ownerPubkey?: string) {
  return useQuery({
    queryKey: ["positions", ownerPubkey],
    queryFn: () => getPositions({ ownerPubkey }),
    enabled: !!ownerPubkey,
  });
}

export function usePosition(positionPubkey: string) {
  return useQuery({
    queryKey: ["position", positionPubkey],
    queryFn: () => getPosition(positionPubkey),
    enabled: !!positionPubkey,
  });
}

export function useClosePosition() {
  const { publicKey, signTransaction } = useWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (positionPubkey: string) => {
      if (!publicKey || !signTransaction) throw new Error("Wallet not connected");
      const response = await closePosition(positionPubkey, publicKey.toBase58());
      if (!response.transaction) throw new Error("No transaction returned");
      const sig = await signAndSend(response.transaction, signTransaction);
      return sig;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["positions"] });
      toast.success("Position closed");
    },
    onError: (error) => {
      toast.error("Failed to close position", { description: error.message });
    },
  });
}

export function useCloseAllPositions() {
  const { publicKey, signTransaction } = useWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!publicKey || !signTransaction) throw new Error("Wallet not connected");
      const ownerPubkey = publicKey.toBase58();

      // Try bulk close first; fall back to closing individually if the bulk
      // endpoint returns a server-side validation error (e.g. NaN in price calc).
      let responses: { transaction: string | null }[];
      let failedCount = 0;
      try {
        responses = await closeAllPositions(ownerPubkey);
      } catch {
        const positions: Position[] = await getPositions({ ownerPubkey });
        const settled: { transaction: string | null }[] = [];
        for (const pos of positions) {
          try {
            settled.push(await closePosition(pos.pubkey, ownerPubkey));
          } catch (e) {
            failedCount++;
            console.warn(`Failed to close position ${pos.pubkey}:`, e);
          }
        }
        responses = settled;
      }

      const results = [];
      for (const response of responses) {
        if (!response.transaction) continue;
        const sig = await signAndSend(response.transaction, signTransaction);
        results.push(sig);
      }
      if (failedCount > 0) {
        toast.warning(`${failedCount} position(s) could not be closed`);
      }
      return results;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["positions"] });
      toast.success("All positions closed");
    },
    onError: (error) => {
      toast.error("Failed to close positions", { description: error.message });
    },
  });
}

export function useClaimPosition() {
  const { publicKey, signTransaction } = useWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (positionPubkey: string) => {
      if (!publicKey || !signTransaction) throw new Error("Wallet not connected");
      const response = await claimPosition(positionPubkey, publicKey.toBase58());
      const sig = await signAndSend(response.transaction, signTransaction);
      return sig;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["positions"] });
      queryClient.invalidateQueries({ queryKey: ["history"] });
      toast.success("Position claimed");
    },
    onError: (error) => {
      toast.error("Failed to claim position", { description: error.message });
    },
  });
}
