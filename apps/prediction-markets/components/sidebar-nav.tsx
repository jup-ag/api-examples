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
    <aside className="flex h-screen w-60 flex-col border-r border-border/40 bg-sidebar">
      <div className="flex h-12 items-center gap-3 border-b border-border/40 px-4">
        <div className="relative">
          <img src="https://jup.ag/svg/jupiter-logo.svg" alt="Jupiter" className="relative z-10 h-7 w-7 shrink-0" />
          <div className="absolute inset-0 h-7 w-7 rounded-full bg-primary/20 blur-lg" />
        </div>
        <div className="leading-tight">
          <span className="text-sm font-bold tracking-tight text-primary">Prediction Markets</span>
          <span className="block text-[10px] font-medium uppercase tracking-widest text-muted-foreground">API Demo</span>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 p-3">
        {NAV_ITEMS.map((item) => {
          const Icon = ICONS[item.icon];
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md border-l-2 px-3 py-2 text-sm font-medium transition-all duration-150",
                isActive
                  ? "border-l-primary bg-primary/[0.07] text-primary"
                  : "border-l-transparent text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border/40 p-3">
        <WalletButton />
      </div>
    </aside>
  );
}
