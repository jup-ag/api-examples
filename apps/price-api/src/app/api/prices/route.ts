import { NextResponse } from "next/server";

// Token mint addresses for the tokens we want to track
// You can add up to 50 comma-separated mints per request
const MINTS = [
  "So11111111111111111111111111111111111111112", // SOL
  "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN", // JUP
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC
].join(",");

/**
 * Proxies the Jupiter Price API v3 to keep the API key server-side.
 *
 * Jupiter Price API docs: https://dev.jup.ag/docs/price/v3
 *
 * Response shape per token:
 * {
 *   usdPrice:        number  — current USD price
 *   liquidity:       number  — total USD liquidity across pools
 *   blockId:         number  — Solana block ID when price was computed
 *   decimals:        number  — token decimal places
 *   createdAt:       string  — ISO timestamp of token creation
 *   priceChange24h:  number  — 24-hour percentage change
 * }
 */
export async function GET() {
  const apiKey = process.env.JUPITER_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "JUPITER_API_KEY not configured" },
      { status: 500 },
    );
  }

  try {
    // Call Jupiter Price API v3 with the API key in the x-api-key header
    const res = await fetch(`https://api.jup.ag/price/v3?ids=${MINTS}`, {
      headers: { "x-api-key": apiKey },
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: `Jupiter API error: ${res.status}`, details: text },
        { status: res.status },
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch prices", details: message },
      { status: 500 },
    );
  }
}
