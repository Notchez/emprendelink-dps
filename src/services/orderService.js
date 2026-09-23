import { apiRequest } from "@/services/apiClient";

export const orderService = {
  async getOrders({ businessId, status, search } = {}) {
    const params = new URLSearchParams();

    if (businessId) params.set("businessId", businessId);
    if (status) params.set("status", status);
    if (search) params.set("search", search);

    const query = params.toString();

    return apiRequest(`/api/orders${query ? `?${query}` : ""}`);
  },

  async getOrder(id) {
    return apiRequest(`/api/orders/${id}`);
  },

  async createOrder(orderData) {
    return apiRequest("/api/orders", {
      method: "POST",
      body: JSON.stringify(orderData),
    });
  },
};
