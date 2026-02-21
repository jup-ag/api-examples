import { NextRequest, NextResponse } from "next/server";

// Server-only — this env var is NOT prefixed with NEXT_PUBLIC_
const RPC_URL = process.env.HELIUS_RPC_URL || "https://api.mainnet-beta.solana.com";

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Only allow sendTransaction — block everything else
  if (body.method !== "sendTransaction") {
    return NextResponse.json(
      { jsonrpc: "2.0", error: { code: -32600, message: "Only sendTransaction is allowed" }, id: body.id },
      { status: 400 }
    );
  }

  const res = await fetch(RPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
