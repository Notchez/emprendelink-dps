import { ORDER_STATUS } from "@/lib/constants/orderStatus";
import { ROLES } from "@/lib/constants/roles";
import { orderDataService } from "@/services/orderDataService";
import { errorResponse, successResponse } from "@/utils/apiResponse";
import { requireSession, requireOrderAccess } from "@/lib/auth/server";
export async function PATCH(request, context) {
  try {
    const session = await requireSession(request, [ROLES.ADMIN, ROLES.ENTREPRENEUR]);
    const { id } = await context.params;
    await requireOrderAccess(session, orderDataService.getOrderById(id), true);
    const data = await request.json();
    if (!Object.values(ORDER_STATUS).includes(data?.status))
      return errorResponse("VALIDATION_ERROR", "Estado no válido.", 400);
    return successResponse(orderDataService.updateStatus(id, data.status, session.user.id));
  } catch (error) {
    return errorResponse(
      error.code || "ORDER_STATUS_ERROR",
      error.status ? error.message : "No se pudo actualizar el estado.",
      error instanceof SyntaxError ? 400 : error.status || 503
    );
  }
}
