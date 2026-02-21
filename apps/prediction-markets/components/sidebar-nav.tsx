"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Briefcase, Clock, User, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/lib/constants";
import { WalletButton } from "@/components/wallet-button";

const ICONS: Record<string, React.ElementType> = {
  Compass,
  Briefcase,
  Clock,
  User,
  Users,
};

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-border bg-card">
      <div className="flex h-14 items-center gap-3 border-b border-border px-4">
        <img src="https://jup.ag/svg/jupiter-logo.svg" alt="Jupiter" className="h-7 w-7 shrink-0" />
        <div className="text-sm font-semibold leading-tight tracking-tight">Prediction Markets<br />API Demo</div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {NAV_ITEMS.map((item) => {
          const Icon = ICONS[item.icon];
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent/50"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-3">
        <WalletButton />
      </div>
    </aside>
  );
}
