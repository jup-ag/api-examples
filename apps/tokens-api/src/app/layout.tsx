import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jupiter Token Explorer",
  description: "Search and explore Solana tokens powered by Jupiter Tokens API v2",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">{children}</body>
    </html>
  );
}
