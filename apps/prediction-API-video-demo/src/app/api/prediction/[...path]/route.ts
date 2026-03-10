import { NextRequest, NextResponse } from "next/server";

const JUPITER_BASE = "https://api.jup.ag/prediction/v1";

async function proxyRequest(req: NextRequest, method: string) {
  const apiKey = process.env.JUPITER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ message: "Missing JUPITER_API_KEY" }, { status: 500 });
  }

  const url = new URL(req.url);
  const pathSegments = url.pathname.replace("/api/prediction/", "");
  const targetUrl = `${JUPITER_BASE}/${pathSegments}${url.search}`;

  const headers: Record<string, string> = {
    "x-api-key": apiKey,
    "Content-Type": "application/json",
  };

  const fetchOptions: RequestInit = { method, headers };

  if (method !== "GET" && method !== "HEAD") {
    try {
      const body = await req.text();
      if (body) fetchOptions.body = body;
    } catch {}
  }

  try {
    const res = await fetch(targetUrl, fetchOptions);
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message || "Proxy error" },
      { status: 502 }
    );
  }
}

export async function GET(req: NextRequest) {
  return proxyRequest(req, "GET");
}

export async function POST(req: NextRequest) {
  return proxyRequest(req, "POST");
}

export async function DELETE(req: NextRequest) {
  return proxyRequest(req, "DELETE");
}
