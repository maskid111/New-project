const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

async function parseApiResponse(response) {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || "Request failed");
  }

  return data;
}

export async function verifyWalletOwnership(address) {
  const response = await fetch(`${API_BASE_URL}/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ address })
  });

  return parseApiResponse(response);
}

export async function fetchWalletActivity(address) {
  const response = await fetch(`${API_BASE_URL}/activity/${address}`);
  return parseApiResponse(response);
}

export async function getXAuthUrl(address) {
  const encoded = encodeURIComponent(address);
  const response = await fetch(`${API_BASE_URL}/auth/x/start?address=${encoded}`);
  return parseApiResponse(response);
}

export function buildProxiedXAvatarUrl(url) {
  if (!url) return "";
  return `${API_BASE_URL}/auth/x/avatar?url=${encodeURIComponent(url)}`;
}
