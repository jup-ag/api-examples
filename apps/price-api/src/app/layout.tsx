import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jupiter Price Dashboard",
  description: "Live token price dashboard powered by Jupiter Price API v3",
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
