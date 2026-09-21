import { apiRequest } from "@/services/apiClient";

export const orderService = {
  // Consulta el listado de pedidos.
  async getOrders({ businessId, status, search } = {}) {
    const params = new URLSearchParams();

    if (businessId) params.set("businessId", businessId);
    if (status) params.set("status", status);
    if (search) params.set("search", search);

    const query = params.toString();
    return apiRequest(`/api/orders${query ? `?${query}` : ""}`);
  },

  // Consulta el detalle de un pedido.
  async getOrder(id) {
    return apiRequest(`/api/orders/${id}`);
  },

  // Envía los datos para crear un pedido.
  async createOrder(orderData) {
    return apiRequest("/api/orders", {
      method: "POST",
      body: JSON.stringify(orderData),
    });
  },
};
