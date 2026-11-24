import { ORDER_STATUS } from "@/lib/constants/orderStatus";
import { ROLES } from "@/lib/constants/roles";
import { orderFirestoreService } from "@/services/orderFirestoreService";
import { errorResponse, successResponse } from "@/utils/apiResponse";
import { requireSession, requireOrderAccess } from "@/lib/auth/server";

export async function PATCH(request, context) {
  try {
    const session = await requireSession(request, [ROLES.ADMIN, ROLES.ENTREPRENEUR]);

    const { id } = await context.params;

    const order = await orderFirestoreService.getOrderById(id);

    await requireOrderAccess(session, order, true);

    const data = await request.json();

    if (!Object.values(ORDER_STATUS).includes(data?.status)) {
      return errorResponse("VALIDATION_ERROR", "Estado no válido.", 400);
    }

    const result = await orderFirestoreService.updateStatus(id, data.status, session.user.id);

    return successResponse(result);
  } catch (error) {
    return errorResponse(
      error.code || "ORDER_STATUS_ERROR",
      error.status ? error.message : "No se pudo actualizar el estado.",
      error instanceof SyntaxError ? 400 : error.status || 503
    );
  }
}
