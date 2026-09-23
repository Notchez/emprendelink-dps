import { orderDataService } from "@/services/orderDataService";
import { errorResponse, successResponse } from "@/utils/apiResponse";
import { requireSession, requireOrderAccess } from "@/lib/auth/server";
export async function GET(request, context) {
  try {
    const session = await requireSession(request);
    const { id } = await context.params;
    const order = orderDataService.getOrderById(id);
    await requireOrderAccess(session, order);
    return successResponse(order);
  } catch (error) {
    return errorResponse(
      error.code || "ORDER_READ_ERROR",
      error.status ? error.message : "No se pudo consultar el pedido.",
      error.status || 503
    );
  }
}
