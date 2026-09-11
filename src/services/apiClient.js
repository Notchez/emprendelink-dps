export async function apiRequest(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  let payload;

  try {
    payload = await response.json();
  } catch {
    throw new Error("La API devolvió una respuesta no válida.");
  }

  if (!response.ok || payload.success === false) {
    const error = new Error(payload?.error?.message || "Ocurrió un error en la solicitud.");
    error.code = payload?.error?.code || "API_ERROR";
    error.status = response.status;
    throw error;
  }

  return payload.data;
}
