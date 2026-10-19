import { ORDER_STATUS } from "../constants/orderStatus.js";
import { mockBusinesses, mockOrders } from "../data/mockData.js";
import { success, wait } from "./serviceResponse.js";

function cloneOrder(order) {
  return {
    ...order,
    customer: order.customer ? { ...order.customer } : null,
    items: order.items.map((item) => ({ ...item })),
  };
}

export function createOrderService({ initialOrders = mockOrders, waitForDelay = wait } = {}) {
  let runtimeOrders = initialOrders.map(cloneOrder);

  return {
    async getCustomerOrders(customerId) {
      await waitForDelay();
      const orders = runtimeOrders
        .filter((order) => order.customerId === customerId)
        .map((order) => ({
          ...cloneOrder(order),
          businessName:
            order.businessName ??
            mockBusinesses.find((business) => business.id === order.businessId)?.name ??
            "Negocio",
        }));
      return success(orders);
    },

    async createMockOrder({ user, business, items, subtotal }) {
      await waitForDelay(700);
      const order = {
        id: `order_mock_${Date.now()}`,
        businessId: business.id,
        businessName: business.name,
        customerId: user.id,
        customer: { name: user.name, phone: user.phone, email: user.email },
        items: items.map((item) => ({
          productId: item.id,
          productName: item.name,
          quantity: item.quantity,
          unitPrice: item.price,
          lineTotal: Number((item.price * item.quantity).toFixed(2)),
        })),
        subtotal: Number(subtotal.toFixed(2)),
        deliveryAddress: user.address || "Dirección pendiente",
        notes: user.deliveryInstructions || null,
        status: ORDER_STATUS.PENDING,
        createdAt: new Date().toISOString(),
        commissionPlanId: business.planId,
        commissionPlanName: "Plan de demostración",
        commissionRate: 0.05,
      };

      runtimeOrders = [cloneOrder(order), ...runtimeOrders];
      return success(cloneOrder(order));
    },
  };
}

export const orderService = createOrderService();
