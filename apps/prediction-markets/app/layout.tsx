import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import { SidebarNav } from "@/components/sidebar-nav";
import { TradingStatusDot } from "@/components/trading-status-dot";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono" });

export const metadata: Metadata = {
  title: "Jupiter Prediction Markets",
  description: "Explore, trade, and track prediction markets on Solana — powered by Jupiter",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} ${jetbrainsMono.variable}`}>
        <Providers>
          <div className="flex h-screen">
            <SidebarNav />
            <div className="flex flex-1 flex-col overflow-hidden">
              <header className="flex h-12 items-center justify-end border-b border-border/50 px-6">
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
