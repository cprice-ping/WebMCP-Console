const CONFIG_KEY = "p1.oidc.config";
const SESSION_KEY = "p1.oidc.session";
const TX_KEY = "p1.oidc.tx";

function base64UrlEncode(bytes) {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function randomString(length = 48) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return base64UrlEncode(bytes);
}

async function sha256(text) {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return new Uint8Array(digest);
}

function storageGet(key, fallback) {
  const value = localStorage.getItem(key);
  if (!value) {
    return fallback;
  }
  try {
    return JSON.parse(value);
  } catch (_error) {
    return fallback;
  }
}

function storageSet(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function transactionGet() {
  const value = sessionStorage.getItem(TX_KEY);
  if (!value) {
    return null;
  }
  try {
    return JSON.parse(value);
  } catch (_error) {
    return null;
  }
}

function transactionSet(value) {
  sessionStorage.setItem(TX_KEY, JSON.stringify(value));
}

function transactionClear() {
  sessionStorage.removeItem(TX_KEY);
}

function removeAuthQueryParams() {
  const url = new URL(window.location.href);
  url.searchParams.delete("code");
  url.searchParams.delete("state");
  url.searchParams.delete("error");
  url.searchParams.delete("error_description");
  history.replaceState({}, document.title, url.toString());
}

export function getAuthzEndpoint(envId) {
  return `https://auth.pingone.com/${envId}/as/authorize`;
}

export function getTokenEndpoint(envId) {
  return `https://auth.pingone.com/${envId}/as/token`;
}

export function getUserInfoEndpoint(envId) {
  return `https://auth.pingone.com/${envId}/as/userinfo`;
}

export function loadOidcConfig() {
  return storageGet(CONFIG_KEY, {
    envId: "",
    clientId: ""
  });
}

export function saveOidcConfig(config) {
  storageSet(CONFIG_KEY, {
    envId: String(config.envId || "").trim(),
    clientId: String(config.clientId || "").trim()
  });
}

export function loadOidcSession() {
  return storageGet(SESSION_KEY, null);
}

export function saveOidcSession(session) {
  storageSet(SESSION_KEY, session);
}

export function clearOidcSession() {
  localStorage.removeItem(SESSION_KEY);
}

export async function buildAuthorizationUrl({ envId, clientId, scope, redirectUri }) {
  const normalizedEnvId = String(envId || "").trim();
  const normalizedClientId = String(clientId || "").trim();
  const normalizedScope = String(scope || "openid profile email").trim();
  const normalizedRedirectUri = String(redirectUri || "").trim();

  if (!normalizedEnvId || !normalizedClientId || !normalizedRedirectUri) {
    throw new Error("EnvID, ClientID, and redirect URI are required.");
  }

  const state = randomString(24);
  const codeVerifier = randomString(64);
  const challengeBytes = await sha256(codeVerifier);
  const codeChallenge = base64UrlEncode(challengeBytes);

  transactionSet({
    envId: normalizedEnvId,
    clientId: normalizedClientId,
    scope: normalizedScope,
    redirectUri: normalizedRedirectUri,
    state,
    codeVerifier,
    createdAt: Date.now()
  });

  const authUrl = new URL(getAuthzEndpoint(normalizedEnvId));
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("client_id", normalizedClientId);
  authUrl.searchParams.set("redirect_uri", normalizedRedirectUri);
  authUrl.searchParams.set("scope", normalizedScope);
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("code_challenge", codeChallenge);
  authUrl.searchParams.set("code_challenge_method", "S256");

  return authUrl.toString();
}

export async function completeLoginFromCurrentUrl() {
  const url = new URL(window.location.href);
  const error = url.searchParams.get("error");
  const errorDescription = url.searchParams.get("error_description") || "";
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  if (!error && !code) {
    return { handled: false };
  }

  if (error) {
    removeAuthQueryParams();
    transactionClear();
    return {
      handled: true,
      error: `${error}${errorDescription ? `: ${errorDescription}` : ""}`
    };
  }

  const tx = transactionGet();
  if (!tx) {
    removeAuthQueryParams();
    return {
      handled: true,
      error: "Missing PKCE transaction. Start login again."
    };
  }

  if (tx.state !== state) {
    removeAuthQueryParams();
    transactionClear();
    return {
      handled: true,
      error: "OIDC state mismatch. Start login again."
    };
  }

  const body = new URLSearchParams();
  body.set("grant_type", "authorization_code");
  body.set("client_id", tx.clientId);
  body.set("code", String(code));
  body.set("redirect_uri", tx.redirectUri);
  body.set("code_verifier", tx.codeVerifier);

  const response = await fetch(getTokenEndpoint(tx.envId), {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded"
    },
    body: body.toString()
  });

  if (!response.ok) {
    const text = await response.text();
    removeAuthQueryParams();
    transactionClear();
    return {
      handled: true,
      error: `Token exchange failed (${response.status}): ${text}`
    };
  }

  const token = await response.json();
  const expiresIn = Number(token.expires_in || 0);
  const session = {
    envId: tx.envId,
    clientId: tx.clientId,
    scope: tx.scope,
    tokenType: token.token_type || "Bearer",
    accessToken: token.access_token || "",
    idToken: token.id_token || "",
    refreshToken: token.refresh_token || "",
    expiresAt: expiresIn > 0 ? Date.now() + expiresIn * 1000 : null
  };

  storageSet(SESSION_KEY, session);
  saveOidcConfig({ envId: tx.envId, clientId: tx.clientId, scope: tx.scope });
  removeAuthQueryParams();
  transactionClear();

  return {
    handled: true,
    session
  };
}

export async function fetchUserInfo(session) {
  const response = await fetch(getUserInfoEndpoint(session.envId), {
    headers: {
      authorization: `Bearer ${session.accessToken}`
    }
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`UserInfo failed (${response.status}): ${text}`);
  }

  return response.json();
}

function decodeBase64Url(value) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  return atob(padded);
}

function parseJwtPayload(jwt) {
  if (!jwt || typeof jwt !== "string") {
    return null;
  }
  const parts = jwt.split(".");
  if (parts.length < 2) {
    return null;
  }
  try {
    const payload = decodeBase64Url(parts[1]);
    return JSON.parse(payload);
  } catch (_error) {
    return null;
  }
}

export function getPreferredUsername(session) {
  if (!session) {
    return "";
  }

  const fromUserInfo = session.userInfo?.preferred_username || session.userInfo?.username;
  if (fromUserInfo) {
    return String(fromUserInfo);
  }

  const idTokenClaims = parseJwtPayload(session.idToken);
  const fromIdToken =
    idTokenClaims?.preferred_username || idTokenClaims?.username || idTokenClaims?.email || idTokenClaims?.sub;
  return fromIdToken ? String(fromIdToken) : "";
}
