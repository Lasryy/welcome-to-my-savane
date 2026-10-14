export async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    credentials: "same-origin",
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });
  const data = response.status === 204 ? null : await response.json();

  if (!response.ok) {
    const error = new Error(data?.message || data?.error || "La demande a échoué.");
    error.status = response.status;
    throw error;
  }
  return data;
}
