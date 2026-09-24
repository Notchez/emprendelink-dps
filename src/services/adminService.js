import { collection, doc, getDocs, updateDoc } from "firebase/firestore";

import { getFirebaseDb } from "@/lib/firebase/client";
import { apiRequest } from "@/services/apiClient";
import { orderService } from "@/services/orderService";
import { ORDER_STATUS } from "@/lib/constants/orderStatus";

function mapDocument(documentSnapshot) {
  return {
    id: documentSnapshot.id,
    ...documentSnapshot.data(),
  };
}

export const adminService = {
  async getOverview() {
    const database = getFirebaseDb();

    const [businessesSnapshot, usersSnapshot, plansSnapshot, orders, commissions] =
      await Promise.all([
        getDocs(collection(database, "businesses")),
        getDocs(collection(database, "users")),
        getDocs(collection(database, "plans")),
        orderService.getOrders(),
        apiRequest("/api/commissions"),
      ]);

    const deliveredOrders = orders.filter((order) => order.status === ORDER_STATUS.DELIVERED);

    const totalSales = deliveredOrders.reduce(
      (total, order) => total + Number(order.subtotal || 0),
      0
    );

    const totalCommissions = commissions.reduce(
      (total, commission) => total + Number(commission.amount || 0),
      0
    );

    return {
      kpis: {
        totalBusinesses: businessesSnapshot.size,

        activeBusinesses: businessesSnapshot.docs.filter((item) => item.data().active === true)
          .length,

        totalUsers: usersSnapshot.size,

        activePlans: plansSnapshot.docs.filter((item) => item.data().active === true).length,

        totalOrders: orders.length,

        totalSales: Number(totalSales.toFixed(2)),

        totalCommissions: Number(totalCommissions.toFixed(2)),
      },

      businesses: businessesSnapshot.docs.map(mapDocument),
    };
  },

  async setBusinessActive(businessId, active) {
    if (typeof active !== "boolean") {
      throw new Error("El estado del negocio no es válido.");
    }

    await updateDoc(doc(getFirebaseDb(), "businesses", businessId), { active });

    return {
      id: businessId,
      active,
    };
  },
};
