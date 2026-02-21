export const API_BASE_URL = "https://api.jup.ag/prediction/v1";

export const API_KEY = process.env.NEXT_PUBLIC_JUPITER_API_KEY ?? "";

export const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

export const CATEGORIES = ["all", "crypto", "sports", "politics", "esports", "culture", "economics", "tech"] as const;
export type Category = (typeof CATEGORIES)[number];

export const FILTERS = ["new", "live", "trending"] as const;
export type Filter = (typeof FILTERS)[number];

export const PAGE_SIZE = 20;

export const SORT_OPTIONS = [
  { label: "Default", value: "default", sortBy: undefined, sortDirection: undefined },
  { label: "Most Volume", value: "most-volume", sortBy: "volume", sortDirection: "desc" },
  { label: "Least Volume", value: "least-volume", sortBy: "volume", sortDirection: "asc" },
  { label: "Newest", value: "newest", sortBy: "beginAt", sortDirection: "desc" },
  { label: "Oldest", value: "oldest", sortBy: "beginAt", sortDirection: "asc" },
] as const;

export type SortOptionValue = (typeof SORT_OPTIONS)[number]["value"];

export const NAV_ITEMS = [
  { label: "Discover", href: "/discover", icon: "Compass" },
  { label: "Positions", href: "/positions", icon: "Briefcase" },
  { label: "History", href: "/history", icon: "Clock" },
  { label: "Profile", href: "/profile", icon: "User" },
  { label: "Community", href: "/community", icon: "Users" },
] as const;
