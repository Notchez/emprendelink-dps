import { commissionsMock } from "@/data/mock/commissionsMock";
import { ORDER_STATUS } from "@/lib/constants/orderStatus";

const DEFAULT_COMMISSION_RATE = 0.03;

export const commissionService = {
  // Busca si el pedido ya tiene comisión.
  getByOrderId(orderId) {
    return commissionsMock.find((commission) => commission.orderId === orderId) ?? null;
  },

  // Crea la comisión cuando el pedido fue entregado.
  createForDeliveredOrder(order) {
    if (order.status !== ORDER_STATUS.DELIVERED) {
      return null;
    }

    const existingCommission = this.getByOrderId(order.id);

    if (existingCommission) {
      return existingCommission;
    }

    const commission = {
      id: `commission-${Date.now()}`,
      orderId: order.id,
      businessId: order.businessId,
      rate: DEFAULT_COMMISSION_RATE,
      amount: Number((order.subtotal * DEFAULT_COMMISSION_RATE).toFixed(2)),
      createdAt: new Date().toISOString(),
    };

    commissionsMock.push(commission);
    return commission;
  },
};
