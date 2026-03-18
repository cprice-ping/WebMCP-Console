const P1_API_BASE = "https://api.pingone.com/v1";

export async function readAllEnvironments(accessToken) {
  const response = await fetch(`${P1_API_BASE}/environments`, {
    headers: { authorization: `Bearer ${accessToken}` }
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GET /environments failed (${response.status}): ${text}`);
  }
  const data = await response.json();
  return data._embedded?.environments ?? [];
}

export async function readAllUsers(accessToken, envId) {
  const response = await fetch(`${P1_API_BASE}/environments/${envId}/users`, {
    headers: { authorization: `Bearer ${accessToken}` }
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GET /users failed (${response.status}): ${text}`);
  }
  const data = await response.json();
  return data._embedded?.users ?? [];
}

export async function readAllApplications(accessToken, envId) {
  const response = await fetch(`${P1_API_BASE}/environments/${envId}/applications`, {
    headers: { authorization: `Bearer ${accessToken}` }
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GET /applications failed (${response.status}): ${text}`);
  }
  const data = await response.json();
  return data._embedded?.applications ?? [];
}

export async function readUserById(accessToken, envId, userId) {
  const response = await fetch(`${P1_API_BASE}/environments/${envId}/users/${userId}`, {
    headers: { authorization: `Bearer ${accessToken}` }
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GET /users/${userId} failed (${response.status}): ${text}`);
  }
  return response.json();
}

export async function readAllResources(accessToken, envId, { expandScopes = false } = {}) {
  const url = new URL(`${P1_API_BASE}/environments/${envId}/resources`);
  if (expandScopes) {
    url.searchParams.set("expand", "scopes");
  }

  const response = await fetch(url.toString(), {
    headers: { authorization: `Bearer ${accessToken}` }
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GET /resources failed (${response.status}): ${text}`);
  }
  const data = await response.json();
  return data._embedded?.resources ?? [];
}

export async function readResourceScopes(accessToken, envId, resourceId) {
  const response = await fetch(`${P1_API_BASE}/environments/${envId}/resources/${resourceId}/scopes`, {
    headers: { authorization: `Bearer ${accessToken}` }
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GET /resources/${resourceId}/scopes failed (${response.status}): ${text}`);
  }
  const data = await response.json();
  return data._embedded?.scopes ?? [];
}

export async function createOidcWebApp(accessToken, envId, payload) {
  const response = await fetch(`${P1_API_BASE}/environments/${envId}/applications`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${accessToken}`,
      "content-type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`POST /applications failed (${response.status}): ${text}`);
  }
  return response.json();
}

export async function createApplicationGrant(accessToken, envId, appId, resourceId, scopeIds) {
  const body = {
    resource: { id: resourceId },
    scopes: scopeIds.map((id) => ({ id }))
  };

  const response = await fetch(`${P1_API_BASE}/environments/${envId}/applications/${appId}/grants`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${accessToken}`,
      "content-type": "application/json"
    },
    body: JSON.stringify(body)
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`POST /applications/${appId}/grants failed (${response.status}): ${text}`);
  }
  return response.json();
}
