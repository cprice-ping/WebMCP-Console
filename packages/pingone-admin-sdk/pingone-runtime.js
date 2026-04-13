// PingOne Runtime API
//
// Server-side operations performed *on behalf of* users from an application
// backend. These endpoints require a privileged worker (M2M) token —
// the end-user's own OIDC token does not have the necessary scopes.
//
// Typical caller pattern (Node / MCP server):
//   import { createWorkerTokenProvider } from "@pingone/admin-sdk/auth";
//   import { getProtectDecision } from "@pingone/admin-sdk/runtime";
//
//   const getToken = createWorkerTokenProvider({ envId, workerId, workerSecret });
//   const decision = await getProtectDecision(await getToken(), envId, body);
//
// All functions accept an options object as their last parameter:
//   { apiBase?: string }  — override the API root for non-production tenants.

const DEFAULT_API_BASE = "https://api.pingone.com/v1";
const DEFAULT_ORCHESTRATE_BASE = "https://orchestrate-api.pingone.com";

const _delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function _call(accessToken, method, url, body, extraHeaders = {}) {
  const res = await fetch(url, {
    method,
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${accessToken}`,
      ...extraHeaders
    },
    body: body !== undefined ? JSON.stringify(body) : undefined
  });
  const contentType = res.headers.get("content-type") || "";
  const payload = await (contentType.includes("application/json") ? res.json() : res.text()).catch(() => undefined);
  if (!res.ok) {
    const detail = typeof payload === "string" ? payload : JSON.stringify(payload);
    throw new Error(`PingOne ${method} ${url} failed ${res.status} ${res.statusText}: ${detail}`);
  }
  return payload;
}

// ---- Sessions ----

export async function getSession(accessToken, envId, sessionToken, { apiBase = DEFAULT_API_BASE } = {}) {
  const res = await fetch(`${apiBase}/environments/${envId}/sessions/me`, {
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${accessToken}`,
      cookie: `ST=${sessionToken}`
    }
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`getSession failed ${res.status} ${res.statusText}: ${text}`);
  }
  return res.json();
}

export async function updateSession(accessToken, envId, sessionToken, session, { apiBase = DEFAULT_API_BASE } = {}) {
  const res = await fetch(`${apiBase}/environments/${envId}/sessions/me`, {
    method: "PUT",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${accessToken}`,
      cookie: `ST=${sessionToken}`
    },
    body: JSON.stringify(session)
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`updateSession failed ${res.status} ${res.statusText}: ${text}`);
  }
  return res.json();
}

// ---- PingOne Authorize ----

export async function getAuthorizeDecision(accessToken, envId, decisionEndpoint, params, { apiBase = DEFAULT_API_BASE } = {}) {
  return _call(accessToken, "POST", `${apiBase}/environments/${envId}/decisionEndpoints/${decisionEndpoint}`, { parameters: params });
}
