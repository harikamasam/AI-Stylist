export const API_BASE_URL =
  process.env.REACT_APP_API_URL || "https://api.aistylist.in";

const REQUEST_TIMEOUT_MS = 12000;

async function parseResponse(response) {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
}

export async function postJson(path, payload, signal) {
  const timeoutController = new AbortController();
  const timeoutId = window.setTimeout(
    () => timeoutController.abort(),
    REQUEST_TIMEOUT_MS
  );

  if (signal) {
    signal.addEventListener(
      "abort",
      () => timeoutController.abort(),
      { once: true }
    );
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: timeoutController.signal,
    });
  } catch (error) {
    if (signal?.aborted) {
      throw new DOMException("The operation was aborted.", "AbortError");
    }

    if (timeoutController.signal.aborted) {
      throw new Error("Request timed out. Please try again.");
    }

    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }

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
