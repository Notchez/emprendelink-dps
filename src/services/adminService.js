import { collection, doc, getDocs, updateDoc } from "firebase/firestore";

import { getFirebaseDb } from "@/lib/firebase/client";
import { apiRequest } from "@/services/apiClient";
import { orderService } from "@/services/orderService";
import { ORDER_STATUS } from "@/lib/constants/orderStatus";

function mapDocument(snapshot) {
  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
}

export const adminService = {
  async getOverview() {
    const database = getFirebaseDb();

    const [
      businessesSnapshot,
      usersSnapshot,
      plansSnapshot,
      productsSnapshot,
      orders,
      commissions,
    ] = await Promise.all([
      getDocs(collection(database, "businesses")),
      getDocs(collection(database, "users")),
      getDocs(collection(database, "plans")),
      getDocs(collection(database, "products")),
      orderService.getOrders(),
      apiRequest("/api/commissions"),
    ]);

    const users = usersSnapshot.docs.map(mapDocument);
    const plans = plansSnapshot.docs.map(mapDocument);
    const products = productsSnapshot.docs.map(mapDocument);

    const usersById = Object.fromEntries(users.map((user) => [user.id, user]));

    const plansById = Object.fromEntries(plans.map((plan) => [plan.id, plan]));

    const activeProductsByBusiness = {};

    for (const product of products) {
      if (!product.active) continue;

      activeProductsByBusiness[product.businessId] =
        (activeProductsByBusiness[product.businessId] || 0) + 1;
    }

    const businesses = businessesSnapshot.docs.map((snapshot) => {
      const business = mapDocument(snapshot);
      const owner = usersById[business.ownerId];
      const plan = plansById[business.planId];

      return {
        ...business,
        ownerName: owner?.name || "Propietario no disponible",
        ownerEmail: owner?.email || "",
        planName: plan?.name || "Plan no disponible",
        planCommissionRate: plan?.commissionRate ?? null,
        planMaxActiveProducts: plan?.maxActiveProducts ?? null,
        activeProductsCount: activeProductsByBusiness[business.id] || 0,
      };
    });

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

        activeBusinesses: businesses.filter((business) => business.active === true).length,

        totalUsers: usersSnapshot.size,

        activePlans: plans.filter((plan) => plan.active === true).length,

        totalOrders: orders.length,

        totalSales: Number(totalSales.toFixed(2)),

        totalCommissions: Number(totalCommissions.toFixed(2)),
      },

      businesses,

      plans: plans.sort((a, b) => a.maxActiveProducts - b.maxActiveProducts),
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

  async changeBusinessPlan(businessId, planId) {
    return apiRequest(`/api/admin/businesses/${encodeURIComponent(businessId)}/plan`, {
      method: "PATCH",
      body: JSON.stringify({ planId }),
    });
  },
};
