import { orderDataService } from "@/services/orderDataService";
import { errorResponse, successResponse } from "@/utils/apiResponse";
import { validateOrderPayload } from "@/utils/orderValidation";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const orders = orderDataService.getOrders({
    businessId: searchParams.get("businessId") || "",
    status: searchParams.get("status") || "",
    search: searchParams.get("search") || "",
  });

  return successResponse(orders);
}

export async function POST(request) {
  try {
    const data = await request.json();
    const validationError = validateOrderPayload(data);

    if (validationError) {
      return errorResponse("VALIDATION_ERROR", validationError, 400);
    }

    const order = orderDataService.createOrder(data);
    return successResponse(order, 201);
  } catch {
    return errorResponse("ORDER_CREATE_ERROR", "No se pudo crear el pedido.", 500);
  }
}
