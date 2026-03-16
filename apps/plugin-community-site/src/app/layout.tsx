import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Token Community Site — Jupiter Plugin Example",
  description:
    "Example community site with an embedded Jupiter Plugin swap widget.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#0a0a0a] text-white antialiased">{children}</body>
    </html>
  );
}
