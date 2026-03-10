import type { Metadata } from "next";
import { WalletProvider } from "@/components/WalletProvider";
import Navbar from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "PredictKick — Football Prediction Markets",
  description:
    "Trade on football match outcomes with Yes/No prediction markets powered by Jupiter on Solana.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-jupiter-bg antialiased">
        <WalletProvider>
          <Navbar />
          <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
        </WalletProvider>
      </body>
    </html>
  );
}
