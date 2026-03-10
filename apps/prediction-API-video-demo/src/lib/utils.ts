// Prices from API are in micro USD: 1,000,000 = $1.00
// e.g., buyYesPriceUsd: 270000 = $0.27 = 27¢ = 27%

export function microToUsd(micro: number | string): number {
  return Number(micro) / 1_000_000;
}

export function usdToMicro(usd: number): string {
  return Math.round(usd * 1_000_000).toString();
}

/** 270000 → "27%" */
export function microToPercent(micro: number | string): string {
  const pct = (Number(micro) / 1_000_000) * 100;
  return `${Math.round(pct)}%`;
}

/** 270000 → "27¢" */
export function microToCents(micro: number | string): string {
  const cents = Number(micro) / 10_000;
  if (cents % 1 === 0) return `${cents}¢`;
  return `${cents.toFixed(1)}¢`;
}

/** Format large micro-USD volume: 264174112000000 → "$264,174,112" */
export function formatVolume(microUsd: number | string): string {
  const usd = Math.round(Number(microUsd) / 1_000_000);
  return `$${usd.toLocaleString("en-US")}`;
}

/** Format smaller volumes (already in USD or small micro) */
export function formatUsd(value: number | string): string {
  const n = Number(value);
  // If it looks like micro USD (> 10000), convert
  if (n > 10000) {
    const usd = n / 1_000_000;
    return `$${usd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** Countdown: unix timestamp → "21d 31m" or "08d 21h 01m" */
export function formatTimeRemaining(unixSeconds: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = unixSeconds - now;
  if (diff <= 0) return "Ended";
  const days = Math.floor(diff / 86400);
  const hours = Math.floor((diff % 86400) / 3600);
  const minutes = Math.floor((diff % 3600) / 60);
  if (days > 0) {
    return hours > 0 ? `${days}d ${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m` : `${days}d ${String(minutes).padStart(2, "0")}m`;
  }
  if (hours > 0) return `${hours}h ${String(minutes).padStart(2, "0")}m`;
  return `${minutes}m`;
}

export function shortenAddress(address: string, chars = 4): string {
  if (!address) return "";
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}

export function formatDate(date: string | number): string {
  const d = typeof date === "number" ? new Date(date * 1000) : new Date(date);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function formatDateTime(date: string): string {
  return new Date(date).toLocaleString("en-US", {
    month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
  });
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function getPnlColor(pnl: number): string {
  if (pnl > 0) return "text-jupiter-green";
  if (pnl < 0) return "text-jupiter-red";
  return "text-jupiter-muted";
}

export function getPnlSign(pnl: number): string {
  return pnl > 0 ? "+" : "";
}
