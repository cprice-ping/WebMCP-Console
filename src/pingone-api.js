const P1_API_BASE = "https://api.pingone.com/v1";

export async function readAllEnvironments(accessToken) {
  const response = await fetch(`${P1_API_BASE}/environments`, {
    headers: {
      authorization: `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GET /environments failed (${response.status}): ${text}`);
  }

  const data = await response.json();
  return data._embedded?.environments ?? [];
}
