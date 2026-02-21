import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "@/components/providers";
import { SidebarNav } from "@/components/sidebar-nav";
import { TradingStatusDot } from "@/components/trading-status-dot";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Jupiter Prediction Markets",
  description: "Explore, trade, and track prediction markets on Solana — powered by Jupiter",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="flex h-screen">
            <SidebarNav />
            <div className="flex flex-1 flex-col overflow-hidden">
              <header className="flex h-14 items-center justify-between border-b border-border px-6">
                <div />
                <TradingStatusDot />
              </header>
              <main className="flex-1 overflow-y-auto p-6">{children}</main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
