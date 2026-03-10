const API_BASE = "/api/prediction";

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `API error: ${res.status}`);
  }
  return res.json();
}

// Events — pagination uses start/end (not limit)
export function getEvents(params?: {
  category?: string;
  subcategory?: string;
  filter?: string;
  provider?: string;
  start?: number;
  end?: number;
}) {
  const sp = new URLSearchParams();
  sp.set("includeMarkets", "true");
  if (params?.category) sp.set("category", params.category);
  if (params?.subcategory) sp.set("subcategory", params.subcategory);
  if (params?.filter) sp.set("filter", params.filter);
  if (params?.provider) sp.set("provider", params.provider);
  sp.set("start", String(params?.start ?? 0));
  sp.set("end", String(params?.end ?? 20));
  return fetchApi<{ data: any[]; pagination: { start: number; end: number; total: number; hasNext: boolean } }>(
    `/events?${sp.toString()}`
  );
}

export function searchEvents(query: string, end = 20) {
  const sp = new URLSearchParams({ query, start: "0", end: String(end), includeMarkets: "true" });
  return fetchApi<{ data: any[]; pagination: any }>(`/events/search?${sp.toString()}`);
}

export function getEvent(eventId: string) {
  return fetchApi<any>(`/events/${eventId}?includeMarkets=true`);
}

// Markets
export function getMarket(marketId: string) {
  return fetchApi<any>(`/markets/${marketId}`);
}

export function getOrderBook(marketId: string) {
  return fetchApi<any>(`/orderbook/${marketId}`);
}

// Orders
export function createOrder(params: {
  ownerPubkey: string;
  marketId: string;
  isYes: boolean;
  isBuy: boolean;
  depositAmount: string;
  depositMint?: string;
}) {
  return fetchApi<any>("/orders", {
    method: "POST",
    body: JSON.stringify({
      depositMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      ...params,
    }),
  });
}

export function getOrderStatus(orderPubkey: string) {
  return fetchApi<any>(`/orders/status/${orderPubkey}`);
}

export function getUserOrders(ownerPubkey: string) {
  return fetchApi<{ data: any[] }>(`/orders?ownerPubkey=${ownerPubkey}`);
}

// Positions
export function getPositions(ownerPubkey: string) {
  return fetchApi<{ data: any[] }>(`/positions?ownerPubkey=${ownerPubkey}`);
}

export function closePosition(positionPubkey: string, ownerPubkey: string) {
  return fetchApi<any>(`/positions/${positionPubkey}`, {
    method: "DELETE",
    body: JSON.stringify({ ownerPubkey }),
  });
}

export function closeAllPositions(ownerPubkey: string) {
  return fetchApi<any>("/positions", {
    method: "DELETE",
    body: JSON.stringify({ ownerPubkey }),
  });
}

export function claimPosition(positionPubkey: string, ownerPubkey: string) {
  return fetchApi<any>(`/positions/${positionPubkey}/claim`, {
    method: "POST",
    body: JSON.stringify({ ownerPubkey }),
  });
}

// History
export function getHistory(ownerPubkey: string) {
  return fetchApi<{ data: any[] }>(`/history?ownerPubkey=${ownerPubkey}`);
}

// Leaderboard
export function getLeaderboard() {
  return fetchApi<{ data: any[] }>("/leaderboards");
}
