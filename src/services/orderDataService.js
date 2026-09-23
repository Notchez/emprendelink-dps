import { ordersMock } from "@/data/mock/ordersMock";
import { orderHistoryMock } from "@/data/mock/orderHistoryMock";
import { ORDER_STATUS, canTransitionOrderStatus } from "@/lib/constants/orderStatus";
import { commissionService } from "@/services/commissionService";

function createServiceError(code, message, status) {
  const error = new Error(message);
  error.code = code;
  error.status = status;
  return error;
}

function prepareItems(items) {
  return items.map((item) => {
    const quantity = Number(item.quantity);
    const unitPrice = Number(item.unitPrice);

    return {
      productId: item.productId,
      productName: item.productName,
      quantity,
      unitPrice,
      lineTotal: Number((quantity * unitPrice).toFixed(2)),
    };
  });
}

export const orderDataService = {
  // Obtiene pedidos y aplica los filtros enviados.
  getOrders({ businessId, status, search } = {}) {
    let orders = [...ordersMock];

    if (businessId) {
      orders = orders.filter((order) => order.businessId === businessId);
    }

    if (status) {
      orders = orders.filter((order) => order.status === status);
    }

    if (search) {
      const value = search.toLowerCase();
      orders = orders.filter(
        (order) =>
          order.id.toLowerCase().includes(value) || order.customerId.toLowerCase().includes(value)
      );
    }

    return orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  // Busca un pedido por su id.
  getOrderById(id) {
    return ordersMock.find((order) => order.id === id) ?? null;
  },

  // Crea un pedido nuevo con estado pendiente.
  createOrder(data) {
    const items = prepareItems(data.items);
    const subtotal = Number(items.reduce((total, item) => total + item.lineTotal, 0).toFixed(2));
    const createdAt = new Date().toISOString();
    const order = {
      id: `order-${Date.now()}`,
      businessId: data.businessId,
      customerId: data.customerId,
      items,
      subtotal,
      deliveryAddress: data.deliveryAddress.trim(),
      notes: data.notes?.trim() || null,
      status: ORDER_STATUS.PENDING,
      createdAt,
    };

    ordersMock.push(order);
    orderHistoryMock.push({
      orderId: order.id,
      oldStatus: null,
      newStatus: ORDER_STATUS.PENDING,
      changedBy: data.createdBy || "cliente-publico",
      changedAt: createdAt,
    });

    return order;
  },

  // Cambia el estado y guarda el movimiento en el historial.
  updateStatus(id, nextStatus, changedBy) {
    const order = this.getOrderById(id);

    if (!order) {
      throw createServiceError("ORDER_NOT_FOUND", "El pedido no existe.", 404);
    }

    if (!canTransitionOrderStatus(order.status, nextStatus)) {
      throw createServiceError(
        "INVALID_STATUS_TRANSITION",
        "El cambio de estado seleccionado no está permitido.",
        409
      );
    }

    const oldStatus = order.status;
    order.status = nextStatus;
    const changedAt = new Date().toISOString();

    orderHistoryMock.push({
      orderId: order.id,
      oldStatus,
      newStatus: nextStatus,
      changedBy,
      changedAt,
    });

    const commission = commissionService.createForDeliveredOrder(order);

    return { order, commission };
  },

  // Devuelve los cambios que ha tenido el pedido.
  getHistory(orderId) {
    return orderHistoryMock
      .filter((history) => history.orderId === orderId)
      .sort((a, b) => new Date(b.changedAt) - new Date(a.changedAt));
  },
};
