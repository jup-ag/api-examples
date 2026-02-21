import { API_BASE_URL, API_KEY } from "./constants";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface EventMetadata {
  title: string;
  slug?: string;
  subtitle?: string;
  imageUrl?: string;
  isLive?: boolean;
  series?: string;
  eventId?: string;
  closeTime?: string;
}

export interface MarketMetadata {
  marketId?: string;
  eventId?: string;
  title: string;
  subtitle?: string;
  description?: string;
  closeTime?: number;
  openTime?: number;
  settlementTime?: number;
  isTeamMarket?: boolean;
  isTradable?: boolean;
  rulesPrimary?: string;
  rulesSecondary?: string;
  status?: string;
  result?: string;
}

export interface MarketPricing {
  buyYesPriceUsd: number | null;
  buyNoPriceUsd: number | null;
  sellYesPriceUsd: number | null;
  sellNoPriceUsd: number | null;
  volume: number;
  openInterest?: number;
  volume24h?: number;
  liquidityDollars?: number;
  notionalValueDollars?: number;
}

export interface Market {
  marketId: string;
  eventId?: string;
  status: "open" | "closed";
  result: "yes" | "no" | null;
  openTime: number;
  closeTime: number;
  resolveAt: number | null;
  metadata: MarketMetadata;
  pricing: MarketPricing;
}

export interface ForecastData {
  [key: string]: unknown;
}

export interface PredictionEvent {
  eventId: string;
  isActive: boolean;
  isLive?: boolean;
  isTrending?: boolean;
  isRecommended?: boolean;
  category: string;
  subcategory: string;
  series?: string;
  winner?: string;
  multipleWinners?: boolean;
  metadata: EventMetadata;
  markets?: Market[];
  volumeUsd?: string;
  tvlDollars?: string;
  closeCondition?: string;
  beginAt: string | null;
  rulesPdf?: string;
}

export interface Order {
  pubkey: string;
  owner: string;
  ownerPubkey: string;
  market: string;
  marketId: string;
  marketIdHash: string;
  eventId: string;
  position: string;
  status: "pending" | "filled" | "failed";
  isYes: boolean;
  isBuy: boolean;
  createdAt: number;
  updatedAt: number;
  contracts: string;
  maxFillPriceUsd: string;
  maxBuyPriceUsd: string | null;
  minSellPriceUsd: string | null;
  filledAt: number;
  filledContracts: string;
  avgFillPriceUsd: string;
  settled: boolean;
  orderId: string;
  sizeUsd: string;
  eventMetadata: EventMetadata;
  marketMetadata: MarketMetadata;
  externalOrderId: string;
  bump: number;
}

export interface Position {
  pubkey: string;
  owner: string;
  ownerPubkey: string;
  market: string;
  marketId: string;
  marketIdHash: string;
  eventId: string;
  isYes: boolean;
  contracts: string;
  totalCostUsd: string;
  sizeUsd: string;
  valueUsd: string | null;
  avgPriceUsd: string;
  markPriceUsd: string | null;
  sellPriceUsd: string | null;
  pnlUsd: string | null;
  pnlUsdPercent: number | null;
  pnlUsdAfterFees: string | null;
  pnlUsdAfterFeesPercent: number | null;
  feesPaidUsd: string;
  realizedPnlUsd: number;
  claimed: boolean;
  claimedUsd: string;
  claimable: boolean;
  claimableAt: number | null;
  payoutUsd: string;
  openOrders: number;
  openedAt: number;
  updatedAt: number;
  settlementDate: number | null;
  bump: number;
  eventMetadata: EventMetadata;
  marketMetadata: MarketMetadata;
}

export interface HistoryEvent {
  id: number;
  eventType: "order_created" | "order_filled" | "order_failed" | "payout_claimed" | "position_updated" | "position_lost";
  signature: string;
  slot: string;
  timestamp: number;
  orderPubkey: string;
  positionPubkey: string;
  marketId: string;
  ownerPubkey: string;
  keeperPubkey: string;
  externalOrderId: string;
  orderId: string;
  isBuy: boolean;
  isYes: boolean;
  contracts: string;
  filledContracts: string;
  contractsSettled: string;
  maxFillPriceUsd: string;
  avgFillPriceUsd: string;
  maxBuyPriceUsd: string | null;
  minSellPriceUsd: string | null;
  depositAmountUsd: string;
  totalCostUsd: string;
  feeUsd: string | null;
  grossProceedsUsd: string;
  netProceedsUsd: string;
  transferAmountToken: string | null;
  realizedPnl: string | null;
  realizedPnlBeforeFees: string | null;
  payoutAmountUsd: string;
  eventId: string;
  marketMetadata: MarketMetadata;
  eventMetadata: EventMetadata;
}

export interface Profile {
  ownerPubkey: string;
  realizedPnlUsd: string;
  totalVolumeUsd: string;
  predictionsCount: string;
  correctPredictions: string;
  wrongPredictions: string;
  totalActiveContracts: string;
  totalPositionsValueUsd: string;
}

export interface PnlHistoryPoint {
  timestamp: number;
  realizedPnlUsd: string;
}

export interface LeaderboardEntry {
  ownerPubkey: string;
  realizedPnlUsd?: string;
  totalVolumeUsd?: string;
  winRatePct?: string;
  predictionsCount?: number;
  correctPredictions?: number;
  wrongPredictions?: number;
  period?: string;
  periodStart?: string | null;
  periodEnd?: string | null;
}

export interface LeaderboardSummary {
  all_time?: { totalVolumeUsd: string; predictionsCount: number };
  weekly?: { totalVolumeUsd: string; predictionsCount: number };
  monthly?: { totalVolumeUsd: string; predictionsCount: number };
}

export interface LeaderboardResponse {
  data: LeaderboardEntry[];
  summary: LeaderboardSummary;
}

export interface Trade {
  id: number;
  action: string;
  side: string;
  amountUsd: string;
  priceUsd: string;
  ownerPubkey: string;
  eventTitle: string;
  marketTitle: string;
  eventImageUrl?: string;
  eventId?: string;
  marketId?: string;
  message?: string;
  timestamp: number;
}

// Orderbook: each side is an array of [price_cents, size] tuples
export interface Orderbook {
  yes: [number, number][];
  no: [number, number][];
  yes_dollars?: [number, number][];
  no_dollars?: [number, number][];
}

export interface CreateOrderRequest {
  ownerPubkey: string;
  marketId: string;
  positionPubkey?: string;
  isYes: boolean;
  isBuy: boolean;
  contracts?: string | number;
  depositAmount?: string | number;
  depositMint?: string;
}

export interface TxMeta {
  blockhash: string;
  lastValidBlockHeight: number;
}

export interface CreateOrderResponse {
  transaction: string | null;
  txMeta: TxMeta | null;
  externalOrderId: string | null;
  order: {
    orderPubkey: string | null;
    orderAtaPubkey: string | null;
    userPubkey: string;
    marketId: string;
    marketIdHash: string;
    positionPubkey: string;
    isBuy: boolean;
    isYes: boolean;
    contracts: string;
    newContracts: string;
    maxBuyPriceUsd: string | null;
    minSellPriceUsd: string | null;
    externalOrderId: string | null;
    orderCostUsd: string;
    newAvgPriceUsd: string;
    newSizeUsd: string;
    newPayoutUsd: string;
    estimatedProtocolFeeUsd: string;
    estimatedVenueFeeUsd: string;
    estimatedTotalFeeUsd: string;
  };
}

export interface ClaimPositionResponse {
  transaction: string;
  txMeta: TxMeta;
  position: {
    positionPubkey: string;
    marketPubkey: string;
    userPubkey: string;
    ownerPubkey: string;
    isYes: boolean;
    contracts: string;
    payoutAmountUsd: string;
  };
}

export interface OrderStatus {
  orderPubkey: string;
  status: string;
  latestEventType: string;
  latestSignature: string;
  externalOrderId: string;
  orderId: string;
  history: Array<{
    eventType: string;
    status: string;
    rawStatus: string;
    timestamp: number;
    signature: string;
    externalOrderId: string;
    orderId: string;
  }>;
}

export interface TradingStatus {
  trading_active: boolean;
}

export interface VaultInfo {
  pubkey: string;
  data: Record<string, string>;
  vaultBalance: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total?: number;
}

export interface EventsPaginatedResponse<T> {
  data: T[];
  pagination: { start: number; end: number; total: number; hasNext: boolean };
}

// ─── API Client ──────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || `API error: ${res.status}`);
  }

  return res.json();
}

async function apiFetchList<T>(path: string, options?: RequestInit): Promise<T[]> {
  const result = await apiFetch<{ data: T[] } | T[]>(path, options);
  if (Array.isArray(result)) return result;
  if (result && typeof result === "object" && "data" in result) return result.data;
  return [];
}

function qs(params: Record<string, unknown>): string {
  const filtered = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "");
  if (filtered.length === 0) return "";
  return "?" + new URLSearchParams(filtered.map(([k, v]) => [k, String(v)])).toString();
}

async function apiFetchPaginated<T>(path: string, options?: RequestInit): Promise<EventsPaginatedResponse<T>> {
  const result = await apiFetch<{ data: T[]; total?: number; start?: number; end?: number }>(path, options);
  const data = Array.isArray(result) ? result : result.data ?? [];
  const total = Array.isArray(result) ? data.length : (result.total ?? data.length);
  const start = Array.isArray(result) ? 0 : (result.start ?? 0);
  const end = Array.isArray(result) ? data.length : (result.end ?? start + data.length);
  return {
    data,
    pagination: { start, end, total, hasNext: end < total },
  };
}

// ─── Events ──────────────────────────────────────────────────────────────────

export async function getEvents(params?: {
  provider?: string;
  includeMarkets?: boolean;
  start?: number;
  end?: number;
  category?: string;
  subcategory?: string;
  sortBy?: string;
  sortDirection?: string;
  filter?: string;
}) {
  return apiFetchList<PredictionEvent>(`/events${qs(params ?? {})}`);
}

export async function getEventsPaginated(params?: {
  provider?: string;
  includeMarkets?: boolean;
  start?: number;
  end?: number;
  category?: string;
  subcategory?: string;
  sortBy?: string;
  sortDirection?: string;
  filter?: string;
}) {
  return apiFetchPaginated<PredictionEvent>(`/events${qs(params ?? {})}`);
}

export async function getEvent(eventId: string, includeMarkets?: boolean) {
  return apiFetch<PredictionEvent>(`/events/${eventId}${qs({ includeMarkets })}`);
}

export async function searchEvents(query: string, params?: { provider?: string; limit?: number }) {
  return apiFetchList<PredictionEvent>(`/events/search${qs({ query, ...params })}`);
}

export async function getSuggestedEvents(pubkey: string, provider?: string) {
  return apiFetchList<PredictionEvent>(`/events/suggested/${pubkey}${qs({ provider })}`);
}

// ─── Markets ─────────────────────────────────────────────────────────────────

export async function getEventMarkets(eventId: string, params?: { start?: number; end?: number }) {
  return apiFetchList<Market>(`/events/${eventId}/markets${qs(params ?? {})}`);
}

export async function getEventMarket(eventId: string, marketId: string) {
  return apiFetch<Market>(`/events/${eventId}/markets/${marketId}`);
}

export async function getMarket(marketId: string) {
  return apiFetch<Market>(`/markets/${marketId}`);
}

// ─── Orderbook & Status ──────────────────────────────────────────────────────

export async function getOrderbook(marketId: string) {
  return apiFetch<Orderbook>(`/orderbook/${marketId}`);
}

export async function getForecast() {
  return apiFetch<ForecastData>("/forecast");
}

export async function getTradingStatus() {
  return apiFetch<TradingStatus>("/trading-status");
}

// ─── Orders ──────────────────────────────────────────────────────────────────

export async function getOrders(params?: { start?: number; end?: number; ownerPubkey?: string }) {
  return apiFetchList<Order>(`/orders${qs(params ?? {})}`);
}

export async function getOrder(orderPubkey: string) {
  return apiFetch<Order>(`/orders/${orderPubkey}`);
}

export async function getOrderStatus(orderPubkey: string) {
  return apiFetch<OrderStatus>(`/orders/status/${orderPubkey}`);
}

export async function createOrder(body: CreateOrderRequest) {
  return apiFetch<CreateOrderResponse>("/orders", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// ─── Positions ───────────────────────────────────────────────────────────────

export async function getPositions(params?: {
  start?: number;
  end?: number;
  ownerPubkey?: string;
  marketPubkey?: string;
  marketId?: string;
  isYes?: string;
}) {
  return apiFetchList<Position>(`/positions${qs(params ?? {})}`);
}

export async function getPosition(positionPubkey: string) {
  return apiFetch<Position>(`/positions/${positionPubkey}`);
}

export async function closePosition(positionPubkey: string, ownerPubkey: string) {
  return apiFetch<CreateOrderResponse>(`/positions/${positionPubkey}`, {
    method: "DELETE",
    body: JSON.stringify({ ownerPubkey }),
  });
}

export async function closeAllPositions(ownerPubkey: string) {
  const result = await apiFetch<{ data: (CreateOrderResponse | ClaimPositionResponse)[] }>("/positions", {
    method: "DELETE",
    body: JSON.stringify({ ownerPubkey }),
  });
  return result.data;
}

// ─── Claims ──────────────────────────────────────────────────────────────────

export async function claimPosition(positionPubkey: string, ownerPubkey: string) {
  return apiFetch<ClaimPositionResponse>(`/positions/${positionPubkey}/claim`, {
    method: "POST",
    body: JSON.stringify({ ownerPubkey }),
  });
}

// ─── History ─────────────────────────────────────────────────────────────────

export async function getHistory(params?: {
  start?: number;
  end?: number;
  ownerPubkey?: string;
  id?: number;
  positionPubkey?: string;
}) {
  return apiFetchList<HistoryEvent>(`/history${qs(params ?? {})}`);
}

// ─── Profiles ────────────────────────────────────────────────────────────────

export async function getProfile(ownerPubkey: string) {
  return apiFetch<Profile>(`/profiles/${ownerPubkey}`);
}

export async function getPnlHistory(ownerPubkey: string, params?: { interval?: string; count?: number }) {
  const result = await apiFetch<{ ownerPubkey: string; history: PnlHistoryPoint[] }>(
    `/profiles/${ownerPubkey}/pnl-history${qs(params ?? {})}`
  );
  return result.history;
}

// ─── Leaderboards & Trades ──────────────────────────────────────────────────

export async function getLeaderboards(params?: { period?: string; limit?: number; metric?: string }) {
  return apiFetch<LeaderboardResponse>(`/leaderboards${qs(params ?? {})}`);
}

export async function getTrades() {
  return apiFetchList<Trade>("/trades");
}

// ─── Vault ───────────────────────────────────────────────────────────────────

export async function getVaultInfo() {
  return apiFetch<VaultInfo>("/vault-info");
}
