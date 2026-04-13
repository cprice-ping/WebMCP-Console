// PingOne Admin API
//
// Tenant management operations. The caller's OIDC access token (obtained via
// an authorization_code or implicit flow) is the credential — typically the
// token the WebMCP Console already holds after the user signs in.
//
// All functions accept an options object as their last parameter:
//   { apiBase?: string }  — override the API root for non-production tenants.

const DEFAULT_API_BASE = "https://api.pingone.com/v1";

async function _call(accessToken, method, url, body) {
  const res = await fetch(url, {
    method,
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${accessToken}`
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

// ---- Environments ----

export async function listEnvironments(accessToken, { apiBase = DEFAULT_API_BASE } = {}) {
  const data = await _call(accessToken, "GET", `${apiBase}/environments`);
  return data._embedded?.environments ?? [];
}

// ---- Users ----

export async function listUsers(accessToken, envId, { apiBase = DEFAULT_API_BASE } = {}) {
  const data = await _call(accessToken, "GET", `${apiBase}/environments/${envId}/users`);
  return data._embedded?.users ?? [];
}

export async function getUser(accessToken, envId, userId, { apiBase = DEFAULT_API_BASE } = {}) {
  return _call(accessToken, "GET", `${apiBase}/environments/${envId}/users/${userId}`);
}

// ---- Applications ----

export async function listApplications(accessToken, envId, { apiBase = DEFAULT_API_BASE } = {}) {
  const data = await _call(accessToken, "GET", `${apiBase}/environments/${envId}/applications`);
  return data._embedded?.applications ?? [];
}

// Creates a web (authorization_code) OIDC application. Pass the full payload.
export async function createOidcWebApp(accessToken, envId, payload, { apiBase = DEFAULT_API_BASE } = {}) {
  return _call(accessToken, "POST", `${apiBase}/environments/${envId}/applications`, payload);
}

// Creates a worker (client_credentials) OIDC application.
export async function createOidcServiceApplication(accessToken, envId, displayName, options = {}, { apiBase = DEFAULT_API_BASE } = {}) {
  const body = {
    name: displayName,
    enabled: options.enabled ?? true,
    type: "WORKER",
    protocol: "OPENID_CONNECT",
    grantTypes: ["CLIENT_CREDENTIALS"],
    tokenEndpointAuthMethod: options.tokenEndpointAuthMethod || "CLIENT_SECRET_BASIC",
    ...options.extra
  };
  return _call(accessToken, "POST", `${apiBase}/environments/${envId}/applications`, body);
}

export async function createApplicationGrant(accessToken, envId, appId, resourceId, scopeIds, { apiBase = DEFAULT_API_BASE } = {}) {
  const body = {
    resource: { id: resourceId },
    scopes: scopeIds.map(id => ({ id }))
  };
  return _call(accessToken, "POST", `${apiBase}/environments/${envId}/applications/${appId}/grants`, body);
}

// ---- Resources & Scopes ----

export async function listResources(accessToken, envId, { expandScopes = false, apiBase = DEFAULT_API_BASE } = {}) {
  const url = new URL(`${apiBase}/environments/${envId}/resources`);
  if (expandScopes) url.searchParams.set("expand", "scopes");
  const data = await _call(accessToken, "GET", url.toString());
  return data._embedded?.resources ?? [];
}

export async function listResourceScopes(accessToken, envId, resourceId, { apiBase = DEFAULT_API_BASE } = {}) {
  const data = await _call(accessToken, "GET", `${apiBase}/environments/${envId}/resources/${resourceId}/scopes`);
  return data._embedded?.scopes ?? [];
}
