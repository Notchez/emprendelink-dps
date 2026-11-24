import { requireSession } from "@/lib/auth/server";
import { ROLES } from "@/lib/constants/roles";
import { errorResponse, successResponse } from "@/utils/apiResponse";
// Compatibility endpoint: customer identity now comes from the authenticated account.
export async function POST(request) {
  try {
    const { user } = await requireSession(request, [ROLES.CUSTOMER]);
    return successResponse({ id: user.id, name: user.name, phone: user.phone, email: user.email });
  } catch (error) {
    return errorResponse(
      error.code || "CUSTOMER_ERROR",
      error.status ? error.message : "No se pudo consultar la cuenta.",
      error.status || 503
    );
  }
}
