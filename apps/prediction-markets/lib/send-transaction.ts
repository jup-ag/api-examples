/**
 * Sends a signed transaction via the server-side RPC proxy.
 * The Helius API key stays on the server — never exposed to the browser.
 */
export async function sendTransaction(serialized: Uint8Array | Buffer): Promise<string> {
  const base64 = Buffer.from(serialized).toString("base64");

  const res = await fetch("/api/rpc", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "sendTransaction",
      params: [base64, { encoding: "base64", skipPreflight: true }],
    }),
  });

  const json = await res.json();

  if (json.error) {
    throw new Error(json.error.message ?? `RPC error ${json.error.code}`);
  }

  return json.result;
}
