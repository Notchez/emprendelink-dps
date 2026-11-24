import { orderFirestoreService } from "@/services/orderFirestoreService";
import { errorResponse, successResponse } from "@/utils/apiResponse";
import { requireSession, requireBusinessOwner, prepareOrder, accessError } from "@/lib/auth/server";
import { ROLES } from "@/lib/constants/roles";

export async function GET(request) {
  try {
    const session = await requireSession(request);
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get("businessId") || "";

    if (session.user.role === ROLES.ENTREPRENEUR) {
      if (!businessId) {
        throw accessError("Selecciona tu negocio.", 400);
      }

      await requireBusinessOwner(session, businessId);
    }

    const orders = await orderFirestoreService.getOrders({
      businessId,
      customerId: session.user.role === ROLES.CUSTOMER ? session.user.id : "",
      status: searchParams.get("status") || "",
      search: searchParams.get("search") || "",
    });

    return successResponse(orders);
  } catch (error) {
    return errorResponse(
      error.code || "ORDER_READ_ERROR",
      error.status ? error.message : "No se pudieron consultar los pedidos.",
      error.status || 503
    );
  }
}

export async function POST(request) {
  try {
    const session = await requireSession(request, [ROLES.CUSTOMER]);
    const data = await prepareOrder(session, await request.json());

    const order = await orderFirestoreService.createOrder(data);

    return successResponse(order, 201);
  } catch (error) {
    return errorResponse(
      error.code || "ORDER_CREATE_ERROR",
      error.status ? error.message : "No se pudo crear el pedido.",
      error instanceof SyntaxError ? 400 : error.status || 503
    );
  }
}
