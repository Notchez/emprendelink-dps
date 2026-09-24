import { orderFirestoreService } from "@/services/orderFirestoreService";
import { errorResponse, successResponse } from "@/utils/apiResponse";
import { requireSession, requireOrderAccess } from "@/lib/auth/server";

export async function GET(request, context) {
  try {
    const session = await requireSession(request);
    const { id } = await context.params;

    const order = await orderFirestoreService.getOrderById(id);

    await requireOrderAccess(session, order);

    const history = await orderFirestoreService.getHistory(id);

    return successResponse(history);
  } catch (error) {
    return errorResponse(
      error.code || "ORDER_READ_ERROR",
      error.status ? error.message : "No se pudo consultar el historial.",
      error.status || 503
    );
  }
}
