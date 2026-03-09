import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const apiKey = process.env.JUPITER_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "JUPITER_API_KEY not configured" },
      { status: 500 },
    );
  }

  const query = request.nextUrl.searchParams.get("query") || "";
  const endpoint = request.nextUrl.searchParams.get("endpoint") || "search";

  // Map endpoint param to the actual Tokens API v2 path
  const paths: Record<string, string> = {
    search: `/tokens/v2/search?query=${encodeURIComponent(query)}`,
    trending: `/tokens/v2/toptrending/1h?limit=10`,
    recent: `/tokens/v2/recent`,
    verified: `/tokens/v2/tag?query=verified`,
  };

  const path = paths[endpoint];
  if (!path) {
    return NextResponse.json(
      { error: `Unknown endpoint: ${endpoint}` },
      { status: 400 },
    );
  }

  try {
    const res = await fetch(`https://api.jup.ag${path}`, {
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
      { error: "Failed to fetch tokens", details: message },
      { status: 500 },
    );
  }
}
