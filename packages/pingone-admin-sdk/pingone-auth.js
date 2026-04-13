// PingOne Auth Helpers
//
// Server-side (Node.js / MCP) utilities for obtaining a worker (M2M) token
// via client_credentials. Browser callers (WebMCP Console) don't need this —
// they already hold the user's OIDC access token.

const DEFAULT_AUTH_BASE = "https://auth.pingone.com";

// Performs a single client_credentials token request and returns the raw
// token response { access_token, expires_in, token_type, ... }.
export async function acquireWorkerToken({ authBase = DEFAULT_AUTH_BASE, envId, workerId, workerSecret } = {}) {
  const body = new URLSearchParams({ grant_type: "client_credentials" });
  const res = await fetch(`${authBase}/${envId}/as/token`, {
    method: "POST",
    body,
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      authorization: "Basic " + btoa(`${workerId}:${workerSecret}`)
    }
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`acquireWorkerToken failed ${res.status} ${res.statusText}: ${text}`);
  }
  const data = await res.json();
  if (!data.access_token) throw new Error("acquireWorkerToken: response missing access_token");
  return data;
}

// Returns an async function `() => Promise<string>` that returns a cached
// access token, refreshing it 60 seconds before expiry.
//
// Usage (Node / MCP server):
//   import { createWorkerTokenProvider } from "@pingone/admin-sdk/auth";
//   import { getProtectDecision } from "@pingone/admin-sdk/runtime";
//
//   const getToken = createWorkerTokenProvider({ envId, workerId, workerSecret });
//   const result = await getProtectDecision(await getToken(), envId, body);
export function createWorkerTokenProvider({ authBase = DEFAULT_AUTH_BASE, envId, workerId, workerSecret } = {}) {
  let cache = { token: null, expiresAt: 0 };
  return async function getToken() {
    const now = Math.floor(Date.now() / 1000);
    if (cache.token && cache.expiresAt - 60 > now) return cache.token;
    const data = await acquireWorkerToken({ authBase, envId, workerId, workerSecret });
    const expiresIn = typeof data.expires_in === "number" ? data.expires_in : 3600;
    cache = { token: data.access_token, expiresAt: now + expiresIn };
    return cache.token;
  };
}
