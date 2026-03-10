"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const WalletMultiButton = dynamic(
  () => import("@solana/wallet-adapter-react-ui").then((m) => m.WalletMultiButton),
  { ssr: false }
);

const NAV_ITEMS = [
  { href: "/", label: "Markets" },
  { href: "/positions", label: "Positions" },
  { href: "/history", label: "History" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/profile", label: "Profile" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 border-b border-jupiter-border bg-jupiter-bg/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-jupiter-accent">
              <span className="text-lg font-bold text-jupiter-bg">⚽</span>
            </div>
            <span className="text-lg font-bold text-jupiter-accent">PredictKick</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-jupiter-hover text-jupiter-accent"
                      : "text-jupiter-muted hover:text-jupiter-text hover:bg-jupiter-hover"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        <WalletMultiButton />
      </div>

      {/* Mobile nav */}
      <div className="flex md:hidden overflow-x-auto border-t border-jupiter-border px-2 py-1 gap-1">
        {NAV_ITEMS.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                active
                  ? "bg-jupiter-hover text-jupiter-accent"
                  : "text-jupiter-muted hover:text-jupiter-text"
              )}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
