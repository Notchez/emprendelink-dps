import { ORDER_STATUS } from "@/lib/constants/orderStatus";
import { orderDataService } from "@/services/orderDataService";
import { errorResponse, successResponse } from "@/utils/apiResponse";

export async function PATCH(request, context) {
  try {
    const { id } = await context.params;
    const data = await request.json();

    if (!data.status || !Object.values(ORDER_STATUS).includes(data.status)) {
      return errorResponse("VALIDATION_ERROR", "El estado enviado no es válido.", 400);
    }

    if (!data.changedBy) {
      return errorResponse(
        "VALIDATION_ERROR",
        "No se indicó el usuario responsable del cambio.",
        400
      );
    }

    const result = orderDataService.updateStatus(id, data.status, data.changedBy);
    return successResponse(result);
  } catch (error) {
    return errorResponse(
      error.code || "ORDER_STATUS_ERROR",
      error.message || "No se pudo actualizar el estado del pedido.",
      error.status || 500
    );
  }
}
