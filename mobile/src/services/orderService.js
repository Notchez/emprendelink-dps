import { createApiClient } from "./apiClient.js";
import { authService } from "./authService.js";
import { catalogService } from "./catalogService.js";
import { failure, success } from "./serviceResponse.js";

const UNKNOWN_BUSINESS = "Negocio no disponible";

function withBusinessName(order, names) {
  return {
    ...order,
    businessName: names.get(order.businessId) || UNKNOWN_BUSINESS,
  };
}

export function createOrderService({
  client = createApiClient({ getToken: () => authService.getIdToken() }),
  catalog = catalogService,
} = {}) {
  async function getBusinessNames(orders) {
    const ids = [...new Set(orders.map((order) => order.businessId).filter(Boolean))];
    const names = new Map();
    if (ids.length === 0) return success(names);

    const publicResult = await catalog.getBusinesses();
    if (!publicResult.success) {
      return failure("ORDER_BUSINESS_READ_ERROR", publicResult.error?.message || "No se pudieron cargar los negocios.");
    }
    for (const business of publicResult.data) names.set(business.id, business.name);

    const missingIds = ids.filter((id) => !names.has(id));
    const missingResults = await Promise.all(missingIds.map((id) => catalog.getBusinessById(id)));
    const failedResult = missingResults.find((result) => !result.success);
    if (failedResult) {
      return failure("ORDER_BUSINESS_READ_ERROR", failedResult.error?.message || "No se pudieron cargar los negocios.");
    }
    missingResults.forEach((result) => {
      if (result.data) names.set(result.data.id, result.data.name);
    });
    return success(names);
  }

  return {
    async getCustomerOrders() {
      const result = await client.request("/api/orders");
      if (!result.success || result.data.length === 0) return result;
      const namesResult = await getBusinessNames(result.data);
      if (!namesResult.success) return namesResult;
      return success(result.data.map((order) => withBusinessName(order, namesResult.data)));
    },

    async getOrderById(orderId) {
      const result = await client.request(`/api/orders/${encodeURIComponent(orderId)}`);
      if (!result.success) return result;
      const businessResult = await catalog.getBusinessById(result.data.businessId);
      if (!businessResult.success) {
        return failure("ORDER_BUSINESS_READ_ERROR", businessResult.error?.message || "No se pudo cargar el negocio.");
      }
      const names = new Map();
      if (businessResult.data) names.set(businessResult.data.id, businessResult.data.name);
      return success(withBusinessName(result.data, names));
    },

    getOrderHistory(orderId) {
      return client.request(`/api/orders/${encodeURIComponent(orderId)}/history`);
    },

    async createOrder({ user, business, items }) {
      const result = await client.request("/api/orders", {
        method: "POST",
        body: JSON.stringify({
          businessId: business.id,
          items: items.map((item) => ({ productId: item.id, quantity: item.quantity })),
          deliveryAddress: user.address,
          notes: user.deliveryInstructions || null,
        }),
      });
      if (!result.success) return result;
      return success({ ...result.data, businessName: business.name });
    },
  };
}

export const orderService = createOrderService();
