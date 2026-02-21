"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useWallet } from "@solana/wallet-adapter-react";
import { Transaction, VersionedTransaction } from "@solana/web3.js";
import { getOrders, getOrder, getOrderStatus, createOrder } from "@/lib/api";
import type { CreateOrderRequest } from "@/lib/api";
import { sendTransaction } from "@/lib/send-transaction";
import { toast } from "sonner";

export function useOrders(ownerPubkey?: string) {
  return useQuery({
    queryKey: ["orders", ownerPubkey],
    queryFn: () => getOrders({ ownerPubkey }),
    enabled: !!ownerPubkey,
  });
}

export function useOrder(orderPubkey: string) {
  return useQuery({
    queryKey: ["order", orderPubkey],
    queryFn: () => getOrder(orderPubkey),
    enabled: !!orderPubkey,
  });
}

export function useOrderStatus(orderPubkey: string | undefined) {
  return useQuery({
    queryKey: ["order-status", orderPubkey],
    queryFn: () => getOrderStatus(orderPubkey!),
    enabled: !!orderPubkey,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (data && (data.status === "filled" || data.status === "failed")) return false;
      return 3_000;
    },
  });
}

export function useCreateOrder() {
  const { publicKey, signTransaction } = useWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: Omit<CreateOrderRequest, "ownerPubkey">) => {
      if (!publicKey || !signTransaction) throw new Error("Wallet not connected");

      const response = await createOrder({
        ...request,
        ownerPubkey: publicKey.toBase58(),
      });

      if (!response.transaction) throw new Error("No transaction returned");

      const txBuffer = Buffer.from(response.transaction, "base64");
      let tx: Transaction | VersionedTransaction;
      try {
        tx = VersionedTransaction.deserialize(txBuffer);
      } catch {
        tx = Transaction.from(txBuffer);
      }

      const signed = await signTransaction(tx);
      const serialized = signed.serialize();
      const signature = await sendTransaction(serialized);

      toast.info("Order submitted", { description: `Tx: ${signature.slice(0, 8)}...` });

      return { ...response, signature };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["positions"] });
      toast.success("Order placed successfully");
    },
    onError: (error) => {
      toast.error("Order failed", { description: error.message });
    },
  });
}
