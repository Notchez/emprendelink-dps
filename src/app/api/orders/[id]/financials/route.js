import { getAdminDb } from "@/lib/firebase/admin";
import { ROLES } from "@/lib/constants/roles";
import { requireSession, requireOrderAccess } from "@/lib/auth/server";
import { orderFirestoreService } from "@/services/orderFirestoreService";
import { errorResponse, successResponse } from "@/utils/apiResponse";

export async function GET(request, context) {
  try {
    const session = await requireSession(request, [ROLES.ADMIN, ROLES.ENTREPRENEUR]);

    const { id } = await context.params;

    const order = await orderFirestoreService.getOrderById(id);

    await requireOrderAccess(session, order);

    const db = getAdminDb();

    const businessSnapshot = await db.collection("businesses").doc(order.businessId).get();

    if (!businessSnapshot.exists) {
      return errorResponse(
        "BUSINESS_NOT_FOUND",
        "No se encontró el negocio asociado al pedido.",
        404
      );
    }

    const business = businessSnapshot.data();

    const planSnapshot = business.planId
      ? await db.collection("plans").doc(business.planId).get()
      : null;

    const commissionSnapshot = await db.collection("commissions").doc(order.id).get();

    const currentPlan = planSnapshot?.exists
      ? {
          id: planSnapshot.id,
          name: planSnapshot.data().name,
          commissionRate: planSnapshot.data().commissionRate,
        }
      : null;

    const commission = commissionSnapshot.exists
      ? {
          id: commissionSnapshot.id,
          ...commissionSnapshot.data(),
        }
      : null;

    return successResponse({
      business: {
        id: businessSnapshot.id,
        name: business.name,
      },
      currentPlan,
      commission,
    });
  } catch (error) {
    return errorResponse(
      error.code || "ORDER_FINANCIALS_ERROR",
      error.status ? error.message : "No se pudieron consultar los datos financieros del pedido.",
      error.status || 503
    );
  }
}
