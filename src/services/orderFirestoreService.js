import "server-only";

import { getAdminDb } from "@/lib/firebase/admin";
import { ORDER_STATUS, canTransitionOrderStatus } from "@/lib/constants/orderStatus";

const DEFAULT_COMMISSION_RATE = 0.03;

function createServiceError(code, message, status) {
  const error = new Error(message);
  error.code = code;
  error.status = status;
  return error;
}

function validOrderId(id) {
  return typeof id === "string" && id.length > 0 && !id.includes("/");
}

export const orderFirestoreService = {
  async getOrders({ businessId = "", customerId = "", status = "", search = "" } = {}) {
    let query = getAdminDb().collection("orders");

    if (customerId) {
      query = query.where("customerId", "==", customerId);
    } else if (businessId) {
      query = query.where("businessId", "==", businessId);
    }

    const snapshot = await query.get();

    let orders = snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));

    if (businessId) {
      orders = orders.filter((order) => order.businessId === businessId);
    }

    if (customerId) {
      orders = orders.filter((order) => order.customerId === customerId);
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

  async getOrderById(id) {
    if (!validOrderId(id)) {
      return null;
    }

    const snapshot = await getAdminDb().collection("orders").doc(id).get();

    return snapshot.exists ? { ...snapshot.data(), id: snapshot.id } : null;
  },

  async createOrder(data) {
    const db = getAdminDb();
    const orderRef = db.collection("orders").doc();
    const historyRef = db.collection("orderHistory").doc();

    const items = data.items.map((item) => ({
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      lineTotal: Number((item.quantity * item.unitPrice).toFixed(2)),
    }));

    const subtotal = Number(items.reduce((total, item) => total + item.lineTotal, 0).toFixed(2));

    const createdAt = new Date().toISOString();

    const order = {
      id: orderRef.id,
      businessId: data.businessId,
      customerId: data.customerId,
      customer: data.customer,
      items,
      subtotal,
      deliveryAddress: data.deliveryAddress,
      notes: data.notes,
      status: ORDER_STATUS.PENDING,
      createdAt,
    };

    const history = {
      orderId: order.id,
      oldStatus: null,
      newStatus: ORDER_STATUS.PENDING,
      changedBy: data.createdBy,
      changedAt: createdAt,
    };

    const batch = db.batch();

    batch.set(orderRef, order);
    batch.set(historyRef, history);

    await batch.commit();

    return order;
  },

  async getHistory(orderId) {
    if (!validOrderId(orderId)) {
      return [];
    }

    const snapshot = await getAdminDb()
      .collection("orderHistory")
      .where("orderId", "==", orderId)
      .get();

    return snapshot.docs
      .map((doc) => doc.data())
      .sort((a, b) => new Date(b.changedAt) - new Date(a.changedAt));
  },

  async updateStatus(id, nextStatus, changedBy) {
    if (!validOrderId(id)) {
      throw createServiceError("ORDER_NOT_FOUND", "El pedido no existe.", 404);
    }

    const db = getAdminDb();
    const orderRef = db.collection("orders").doc(id);
    const historyRef = db.collection("orderHistory").doc();

    // Un identificador fijo por pedido evita duplicar su comisión.
    const commissionRef = db.collection("commissions").doc(id);

    return db.runTransaction(async (transaction) => {
      const orderSnapshot = await transaction.get(orderRef);

      if (!orderSnapshot.exists) {
        throw createServiceError("ORDER_NOT_FOUND", "El pedido no existe.", 404);
      }

      const currentOrder = {
        ...orderSnapshot.data(),
        id: orderSnapshot.id,
      };

      if (!canTransitionOrderStatus(currentOrder.status, nextStatus)) {
        throw createServiceError(
          "INVALID_STATUS_TRANSITION",
          "El cambio de estado seleccionado no está permitido.",
          409
        );
      }

      let commission = null;
      let commissionExists = false;

      if (nextStatus === ORDER_STATUS.DELIVERED) {
        const commissionSnapshot = await transaction.get(commissionRef);

        commissionExists = commissionSnapshot.exists;

        if (commissionExists) {
          commission = commissionSnapshot.data();
        } else {
          commission = {
            id: commissionRef.id,
            orderId: currentOrder.id,
            businessId: currentOrder.businessId,
            rate: DEFAULT_COMMISSION_RATE,
            amount: Number((currentOrder.subtotal * DEFAULT_COMMISSION_RATE).toFixed(2)),
            createdAt: new Date().toISOString(),
          };
        }
      }

      const changedAt = new Date().toISOString();

      const history = {
        orderId: currentOrder.id,
        oldStatus: currentOrder.status,
        newStatus: nextStatus,
        changedBy,
        changedAt,
      };

      transaction.update(orderRef, {
        status: nextStatus,
      });

      transaction.set(historyRef, history);

      if (commission && !commissionExists) {
        transaction.create(commissionRef, commission);
      }

      return {
        order: {
          ...currentOrder,
          status: nextStatus,
        },
        commission,
      };
    });
  },
};
