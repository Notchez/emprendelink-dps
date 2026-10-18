import { ORDER_STATUS } from "../constants/orderStatus";
import { mockBusinesses, mockOrders } from "../data/mockData";
import { success, wait } from "./serviceResponse";

export const orderService = {
  async getCustomerOrders(customerId) {
    await wait();
    const orders = mockOrders
      .filter((order) => order.customerId === customerId)
      .map((order) => ({
        ...order,
        businessName: mockBusinesses.find((business) => business.id === order.businessId)?.name ?? "Negocio",
      }));
    return success(orders);
  },

  async createMockOrder({ user, business, items, subtotal }) {
    await wait(700);
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
    return success(order);
  },
};
