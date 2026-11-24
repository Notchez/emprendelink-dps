import { getAdminDb } from "@/lib/firebase/admin";
import { ROLES } from "@/lib/constants/roles";
import { requireSession, requireBusinessOwner, accessError } from "@/lib/auth/server";
import { errorResponse, successResponse } from "@/utils/apiResponse";

export async function GET(request) {
  try {
    const session = await requireSession(request, [ROLES.ADMIN, ROLES.ENTREPRENEUR]);

    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get("businessId") || "";

    if (session.user.role === ROLES.ENTREPRENEUR) {
      if (!businessId) {
        throw accessError("Selecciona tu negocio.", 400);
      }

      await requireBusinessOwner(session, businessId);
    }

    let query = getAdminDb().collection("commissions");

    if (businessId) {
      query = query.where("businessId", "==", businessId);
    }

    const snapshot = await query.get();

    const commissions = snapshot.docs
      .map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return successResponse(commissions);
  } catch (error) {
    return errorResponse(
      error.code || "COMMISSION_READ_ERROR",
      error.status ? error.message : "No se pudieron consultar las comisiones.",
      error.status || 503
    );
  }
}
