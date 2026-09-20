import { orderDataService } from "@/services/orderDataService";
import { errorResponse, successResponse } from "@/utils/apiResponse";

export async function GET(request, context) {
  const { id } = await context.params;
  const order = orderDataService.getOrderById(id);

  if (!order) {
    return errorResponse("ORDER_NOT_FOUND", "El pedido no existe.", 404);
  }

  return successResponse(orderDataService.getHistory(id));
}
