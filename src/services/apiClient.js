import { authService } from "@/services/authService";

export async function apiRequest(path, options = {}) {
  const token = await authService.getToken();
  const response = await fetch(path, {
    ...options,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });
  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new Error("La API devolvió una respuesta no válida.");
  }
  if (!response.ok || payload.success === false) {
    const error = new Error(payload?.error?.message || "No se pudo completar la solicitud.");
    error.code = payload?.error?.code || "API_ERROR";
    error.status = response.status;
    throw error;
  }
  return payload.data;
}
