export interface Event {
  eventId: string;
  category: string;
  metadata: {
    title: string;
    subtitle?: string;
    imageUrl?: string;
    isLive?: boolean;
  };
  markets: Market[];
  volume?: string;
  closingDate?: string;
}

export interface Market {
  marketId: string;
  eventId: string;
  status: "open" | "closed" | "cancelled";
  result: "yes" | "no" | null;
  metadata: {
    title: string;
    subtitle?: string;
    imageUrl?: string;
    rules?: string;
  };
  pricing: {
    buy: { yes: string; no: string };
    sell: { yes: string; no: string };
  };
  volume?: string;
  closingDate?: string;
}

export interface OrderBookEntry {
  price: string;
  size: string;
}

export interface OrderBook {
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
}

export interface Position {
  pubkey: string;
  owner: string;
  marketId: string;
  side: "yes" | "no";
  contracts: string;
  avgPrice: string;
  costBasis: string;
  currentValue: string;
  unrealizedPnl: string;
  claimable: boolean;
  potentialPayout: string;
  market?: {
    metadata: { title: string; imageUrl?: string };
    pricing: { buy: { yes: string; no: string }; sell: { yes: string; no: string } };
    status: string;
    result: string | null;
  };
}

export interface Order {
  pubkey: string;
  owner: string;
  marketId: string;
  side: "yes" | "no";
  type: "buy" | "sell";
  amount: string;
  price: string;
  status: string;
  createdAt: string;
  market?: {
    metadata: { title: string };
  };
}

export interface LeaderboardEntry {
  rank: number;
  wallet: string;
  pnl: string;
  volume: string;
  trades: number;
  winRate: string;
}
