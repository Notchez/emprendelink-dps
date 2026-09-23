import { customerDataService } from "@/services/customerDataService";
import { errorResponse, successResponse } from "@/utils/apiResponse";
import { validateCustomerPayload } from "@/utils/customerValidation";

export async function POST(request) {
  try {
    const data = await request.json();
    const validationError = validateCustomerPayload(data);

    if (validationError) {
      return errorResponse("VALIDATION_ERROR", validationError, 400);
    }

    const customer = customerDataService.createCustomer(data);
    return successResponse(customer, 201);
  } catch {
    return errorResponse("CUSTOMER_CREATE_ERROR", "No se pudo registrar al cliente.", 500);
  }
}
