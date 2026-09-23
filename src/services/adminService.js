import { collection, doc, getDocs, updateDoc } from "firebase/firestore";

import { getFirebaseDb } from "@/lib/firebase/client";
import { orderDataService } from "@/services/orderDataService";

const COMMISSION_RATE = 0.03;

function mapDocument(documentSnapshot) {
  return { id: documentSnapshot.id, ...documentSnapshot.data() };
}

export const adminService = {
  async getOverview() {
    const database = getFirebaseDb();
    const [businessesSnapshot, usersSnapshot, plansSnapshot] = await Promise.all([
      getDocs(collection(database, "businesses")),
      getDocs(collection(database, "users")),
      getDocs(collection(database, "plans")),
    ]);

    const orders = orderDataService.getOrders();
    const totalSales = orders.reduce((total, order) => total + Number(order.subtotal || 0), 0);
    const deliveredSales = orders
      .filter((order) => order.status === "DELIVERED")
      .reduce((total, order) => total + Number(order.subtotal || 0), 0);

    return {
      kpis: {
        totalBusinesses: businessesSnapshot.size,
        activeBusinesses: businessesSnapshot.docs.filter((item) => item.data().active === true).length,
        totalUsers: usersSnapshot.size,
        activePlans: plansSnapshot.docs.filter((item) => item.data().active === true).length,
        totalOrders: orders.length,
        totalSales,
        totalCommissions: deliveredSales * COMMISSION_RATE,
      },
      businesses: businessesSnapshot.docs.map(mapDocument),
    };
  },

  async setBusinessActive(businessId, active) {
    if (typeof active !== "boolean") {
      throw new Error("El estado del negocio no es válido.");
    }

    await updateDoc(doc(getFirebaseDb(), "businesses", businessId), { active });
    return { id: businessId, active };
  },
};
