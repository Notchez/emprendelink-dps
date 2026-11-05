import { failure, success } from "./serviceResponse.js";

function getBaseUrl() {
  const value = String(process.env.EXPO_PUBLIC_API_BASE_URL || "").trim().replace(/\/$/, "");
  if (!value) throw new Error("Falta EXPO_PUBLIC_API_BASE_URL en la configuración móvil.");
  return value;
}

export function createApiClient({ fetchImpl = globalThis.fetch, getToken } = {}) {
  return {
    async request(path, options = {}) {
      try {
        const tokenResult = await getToken();
        if (!tokenResult.success) return tokenResult;
        const response = await fetchImpl(`${getBaseUrl()}${path}`, {
          ...options,
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${tokenResult.data}`,
            ...(options.body ? { "Content-Type": "application/json" } : {}),
            ...options.headers,
          },
        });
        const payload = await response.json().catch(() => null);
        if (!response.ok || payload?.success === false) {
          return failure(
            payload?.error?.code || `HTTP_${response.status}`,
            payload?.error?.message || "El servidor no pudo completar la solicitud."
          );
        }
        return success(payload?.data ?? payload);
      } catch (error) {
        return failure("NETWORK_ERROR", error?.message || "No se pudo conectar con el servidor.");
      }
    },
  };
}
