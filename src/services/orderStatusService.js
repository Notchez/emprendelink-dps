import { apiRequest } from "@/services/apiClient";

export const orderStatusService = {
  // Envía el cambio de estado del pedido.
  async updateStatus(orderId, status, changedBy) {
    return apiRequest(`/api/orders/${orderId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status, changedBy }),
    });
  },

  // Consulta el historial del pedido.
  async getHistory(orderId) {
    return apiRequest(`/api/orders/${orderId}/history`);
  },
};
