"use client";

import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { EndpointProvider } from "@/components/endpoint-toggle";
import { TourProvider } from "@/components/guided-tour";

import "@solana/wallet-adapter-react-ui/styles.css";

// Public RPC for wallet adapter reads (no rate limit for reads).
// Helius is only used for sending transactions — see use-orders.ts / use-positions.ts.
const RPC_ENDPOINT = "https://api.mainnet-beta.solana.com";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <ConnectionProvider endpoint={RPC_ENDPOINT} config={{ commitment: "confirmed" }}>
      <WalletProvider wallets={[]} autoConnect>
        <WalletModalProvider>
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              <TourProvider>
                <EndpointProvider>
                  {children}
                  <Toaster position="bottom-right" richColors />
                </EndpointProvider>
              </TourProvider>
            </TooltipProvider>
          </QueryClientProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
