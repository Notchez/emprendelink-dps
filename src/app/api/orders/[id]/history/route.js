import { orderDataService } from "@/services/orderDataService";
import { errorResponse, successResponse } from "@/utils/apiResponse";
import { requireSession, requireOrderAccess } from "@/lib/auth/server";
export async function GET(request, context) {
  try {
    const session = await requireSession(request);
    const { id } = await context.params;
    await requireOrderAccess(session, orderDataService.getOrderById(id));
    return successResponse(orderDataService.getHistory(id));
  } catch (error) {
    return errorResponse(
      error.code || "ORDER_READ_ERROR",
      error.status ? error.message : "No se pudo consultar el historial.",
      error.status || 503
    );
  }
}
