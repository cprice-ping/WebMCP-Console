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
