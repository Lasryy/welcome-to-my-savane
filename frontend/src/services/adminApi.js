export async function adminRequest(path, { method = "GET", body, signal } = {}) {
  let response;
  const requestOptions = {
    method,
    signal,
    headers: {
      Accept: "application/json",
    },
  };

  if (body !== undefined) {
    requestOptions.headers["Content-Type"] = "application/json";
    requestOptions.body = JSON.stringify(body);
  }

  try {
    response = await fetch(path, requestOptions);
  } catch (error) {
    if (error.name === "AbortError") {
      throw error;
    }
    throw new Error("Impossible de joindre le serveur. Réessayez dans un instant.", { cause: error });
  }

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const fallback = {
      401: "Connectez-vous pour accéder à l’administration.",
      403: "Vous n’avez pas accès à cette action.",
      404: "Cette ressource n’est pas disponible.",
      409: "Cette modification est impossible car des éléments sont encore liés à cette ressource.",
    };
    throw new Error(
      data?.message || data?.error || fallback[response.status] || "L’action a échoué. Réessayez dans un instant.",
    );
  }

  if (data === null) {
    throw new Error("La réponse du serveur ne peut pas être traitée.");
  }
  return data;
}
