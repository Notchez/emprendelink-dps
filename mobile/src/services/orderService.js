import { createApiClient } from "./apiClient.js";
import { authService } from "./authService.js";

export function createOrderService({
  client = createApiClient({ getToken: () => authService.getIdToken() }),
} = {}) {
  return {
    getCustomerOrders() {
      return client.request("/api/orders");
    },

    getOrderById(orderId) {
      return client.request(`/api/orders/${encodeURIComponent(orderId)}`);
    },

    getOrderHistory(orderId) {
      return client.request(`/api/orders/${encodeURIComponent(orderId)}/history`);
    },

    createOrder({ user, business, items }) {
      return client.request("/api/orders", {
        method: "POST",
        body: JSON.stringify({
          businessId: business.id,
          items: items.map((item) => ({ productId: item.id, quantity: item.quantity })),
          deliveryAddress: user.address,
          notes: user.deliveryInstructions || null,
        }),
      });
    },
  };
}

export const orderService = createOrderService();
