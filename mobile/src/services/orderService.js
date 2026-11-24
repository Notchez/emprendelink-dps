import { createApiClient } from "./apiClient.js";
import { authService } from "./authService.js";
import { catalogService } from "./catalogService.js";
import { failure, success } from "./serviceResponse.js";

const UNKNOWN_BUSINESS = "Negocio no disponible";

function withBusinessDetails(order, businesses) {
  const business = businesses.get(order.businessId);
  return {
    ...order,
    businessName: business?.name || UNKNOWN_BUSINESS,
    businessLogoUrl: business?.logoUrl || null,
  };
}

export function createOrderService({
  client = createApiClient({ getToken: () => authService.getIdToken() }),
  catalog = catalogService,
} = {}) {
  async function getBusinessDetails(orders) {
    const ids = [...new Set(orders.map((order) => order.businessId).filter(Boolean))];
    const businesses = new Map();
    if (ids.length === 0) return success(businesses);

    const publicResult = await catalog.getBusinesses();
    if (!publicResult.success) {
      return failure("ORDER_BUSINESS_READ_ERROR", publicResult.error?.message || "No se pudieron cargar los negocios.");
    }
    for (const business of publicResult.data) businesses.set(business.id, business);

    const missingIds = ids.filter((id) => !businesses.has(id));
    const missingResults = await Promise.all(missingIds.map((id) => catalog.getBusinessById(id)));
    const failedResult = missingResults.find((result) => !result.success);
    if (failedResult) {
      return failure("ORDER_BUSINESS_READ_ERROR", failedResult.error?.message || "No se pudieron cargar los negocios.");
    }
    missingResults.forEach((result) => {
      if (result.data) businesses.set(result.data.id, result.data);
    });
    return success(businesses);
  }

  return {
    async getCustomerOrders() {
      const result = await client.request("/api/orders");
      if (!result.success || result.data.length === 0) return result;
      const businessesResult = await getBusinessDetails(result.data);
      if (!businessesResult.success) return businessesResult;
      return success(result.data.map((order) => withBusinessDetails(order, businessesResult.data)));
    },

    async getOrderById(orderId) {
      const result = await client.request(`/api/orders/${encodeURIComponent(orderId)}`);
      if (!result.success) return result;
      const businessResult = await catalog.getBusinessById(result.data.businessId);
      if (!businessResult.success) {
        return failure("ORDER_BUSINESS_READ_ERROR", businessResult.error?.message || "No se pudo cargar el negocio.");
      }
      const businesses = new Map();
      if (businessResult.data) businesses.set(businessResult.data.id, businessResult.data);
      return success(withBusinessDetails(result.data, businesses));
    },

    getOrderHistory(orderId) {
      return client.request(`/api/orders/${encodeURIComponent(orderId)}/history`);
    },

    async createOrder({ user, business, items, deliveryAddress, notes }) {
      const result = await client.request("/api/orders", {
        method: "POST",
        body: JSON.stringify({
          businessId: business.id,
          items: items.map((item) => ({ productId: item.id, quantity: item.quantity })),
          deliveryAddress: deliveryAddress ?? user.address,
          notes: notes ?? user.deliveryInstructions ?? null,
        }),
      });
      if (!result.success) return result;
      return success({ ...result.data, businessName: business.name, businessLogoUrl: business.logoUrl || null });
    },
  };
}

export const orderService = createOrderService();
