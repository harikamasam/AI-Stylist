export const API_BASE_URL =
  process.env.REACT_APP_API_URL || "https://api.aistylist.in";

async function parseResponse(response) {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

export async function postJson(path, payload, signal) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    signal,
  });

  const data = await parseResponse(response);

  if (!response.ok) {
    const message =
      typeof data === "object" && data?.detail
        ? data.detail
        : `Request failed with status ${response.status}`;

    throw new Error(message);
  }

  return data;
}

export function fetchRecommendations(payload, signal) {
  return postJson("/recommend", payload, signal);
}

export function fetchAnalytics(payload, signal) {
  return postJson("/analyze", payload, signal);
}

export function fetchProduct(payload, signal) {
  return postJson("/product", payload, signal);
}

export function fetchOutfitAnalysis(payload, signal) {
  return postJson("/outfit-analysis", payload, signal);
}
