import "server-only";

import { getAdminDb } from "@/lib/firebase/admin";
import { ORDER_STATUS, canTransitionOrderStatus } from "@/lib/constants/orderStatus";

// Los pedidos creados con la implementación anterior no
// guardaban su tasa. Para ellos se conserva el 3 % que
// utilizaba esa implementación.
const LEGACY_COMMISSION_RATE = 0.03;

function createServiceError(code, message, status) {
  const error = new Error(message);
  error.code = code;
  error.status = status;
  return error;
}

function validOrderId(id) {
  return typeof id === "string" && id.length > 0 && !id.includes("/");
}

function roundMoney(value) {
  return Number(value.toFixed(2));
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

    let orders = snapshot.docs.map((document) => ({
      ...document.data(),
      id: document.id,
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
          String(order.id).toLowerCase().includes(value) ||
          String(order.customerId).toLowerCase().includes(value)
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

    const businessRef = db.collection("businesses").doc(data.businessId);

    const items = data.items.map((item) => ({
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      lineTotal: roundMoney(item.quantity * item.unitPrice),
    }));

    const subtotal = roundMoney(items.reduce((total, item) => total + item.lineTotal, 0));

    return db.runTransaction(async (transaction) => {
      // 1. Consultamos el emprendimiento que recibe el pedido.
      const businessSnapshot = await transaction.get(businessRef);

      if (!businessSnapshot.exists) {
        throw createServiceError("BUSINESS_NOT_FOUND", "El emprendimiento no existe.", 404);
      }

      const business = businessSnapshot.data();

      if (business.active !== true) {
        throw createServiceError("BUSINESS_INACTIVE", "El emprendimiento no está disponible.", 409);
      }

      // 2. Identificamos el plan ACTUAL del emprendimiento.
      const planId = business.planId;

      if (typeof planId !== "string" || !planId.trim()) {
        throw createServiceError(
          "PLAN_NOT_CONFIGURED",
          "El emprendimiento no tiene un plan configurado.",
          409
        );
      }

      const planRef = db.collection("plans").doc(planId);

      const planSnapshot = await transaction.get(planRef);

      if (!planSnapshot.exists) {
        throw createServiceError("PLAN_NOT_FOUND", "El plan del emprendimiento no existe.", 409);
      }

      const plan = planSnapshot.data();

      // En Firestore, 7 % se guarda como 0.07.
      const commissionRate = plan.commissionRate;

      if (
        typeof commissionRate !== "number" ||
        !Number.isFinite(commissionRate) ||
        commissionRate < 0 ||
        commissionRate > 1
      ) {
        throw createServiceError(
          "INVALID_COMMISSION_RATE",
          "La tasa de comisión del plan no es válida.",
          409
        );
      }

      const createdAt = new Date().toISOString();

      // 3. Guardamos una copia del plan y su tasa EN EL PEDIDO.
      // Así, un cambio posterior del plan no modifica
      // la comisión correspondiente a esta compra.
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

        commissionPlanId: planSnapshot.id,
        commissionPlanName:
          typeof plan.name === "string" && plan.name.trim() ? plan.name : planSnapshot.id,
        commissionRate,
      };

      const history = {
        orderId: order.id,
        oldStatus: null,
        newStatus: ORDER_STATUS.PENDING,
        changedBy: data.createdBy,
        changedAt: createdAt,
      };

      transaction.set(orderRef, order);
      transaction.set(historyRef, history);

      return order;
    });
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
      .map((document) => document.data())
      .sort((a, b) => new Date(b.changedAt) - new Date(a.changedAt));
  },

  async updateStatus(id, nextStatus, changedBy) {
    if (!validOrderId(id)) {
      throw createServiceError("ORDER_NOT_FOUND", "El pedido no existe.", 404);
    }

    const db = getAdminDb();

    const orderRef = db.collection("orders").doc(id);
    const historyRef = db.collection("orderHistory").doc();

    // Una comisión por pedido: utilizamos el ID del pedido
    // como identificador del documento de comisión.
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
          // Nunca recalculamos ni reemplazamos una
          // comisión que ya quedó registrada.
          commission = commissionSnapshot.data();
        } else {
          const hasStoredRate = Object.prototype.hasOwnProperty.call(
            currentOrder,
            "commissionRate"
          );

          // Los pedidos nuevos usan su propia tasa.
          // Los antiguos conservan el cálculo del
          // sistema anterior: 3 %.
          const rate = hasStoredRate ? currentOrder.commissionRate : LEGACY_COMMISSION_RATE;

          if (typeof rate !== "number" || !Number.isFinite(rate) || rate < 0 || rate > 1) {
            throw createServiceError(
              "INVALID_COMMISSION_RATE",
              "La tasa registrada en el pedido no es válida.",
              409
            );
          }

          commission = {
            id: commissionRef.id,
            orderId: currentOrder.id,
            businessId: currentOrder.businessId,
            rate,
            amount: roundMoney(currentOrder.subtotal * rate),
            createdAt: new Date().toISOString(),
          };

          if (currentOrder.commissionPlanId) {
            commission.planId = currentOrder.commissionPlanId;
          }
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
