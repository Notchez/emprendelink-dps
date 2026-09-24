import { getAdminDb } from "@/lib/firebase/admin";
import { requireSession } from "@/lib/auth/server";
import { ROLES } from "@/lib/constants/roles";
import { errorResponse, successResponse } from "@/utils/apiResponse";

function validationError(message, status = 400) {
  const error = new Error(message);
  error.code = "BUSINESS_PLAN_ERROR";
  error.status = status;
  return error;
}

function validDocumentId(value) {
  return typeof value === "string" && value.trim().length > 0 && !value.includes("/");
}

export async function PATCH(request, context) {
  try {
    await requireSession(request, [ROLES.ADMIN]);

    const { id } = await context.params;
    const body = await request.json();
    const planId = body?.planId;

    if (!validDocumentId(id)) {
      throw validationError("El identificador del emprendimiento no es válido.");
    }

    if (!validDocumentId(planId)) {
      throw validationError("Selecciona un plan válido.");
    }

    const db = getAdminDb();

    const businessRef = db.collection("businesses").doc(id);
    const planRef = db.collection("plans").doc(planId);

    const result = await db.runTransaction(async (transaction) => {
      const businessSnapshot = await transaction.get(businessRef);

      if (!businessSnapshot.exists) {
        throw validationError("El emprendimiento no existe.", 404);
      }

      const planSnapshot = await transaction.get(planRef);

      if (!planSnapshot.exists) {
        throw validationError("El plan seleccionado no existe.", 404);
      }

      const business = businessSnapshot.data();
      const plan = planSnapshot.data();

      if (plan.active !== true) {
        throw validationError("No puedes asignar un plan desactivado.", 409);
      }

      if (!Number.isInteger(plan.maxActiveProducts) || plan.maxActiveProducts < 1) {
        throw validationError("El plan no tiene un límite de productos válido.", 409);
      }

      if (
        typeof plan.commissionRate !== "number" ||
        !Number.isFinite(plan.commissionRate) ||
        plan.commissionRate < 0 ||
        plan.commissionRate > 1
      ) {
        throw validationError("El plan no tiene una tasa de comisión válida.", 409);
      }

      const productsQuery = db
        .collection("products")
        .where("businessId", "==", id)
        .where("active", "==", true);

      const productsSnapshot = await transaction.get(productsQuery);

      const activeProducts = productsSnapshot.size;

      if (activeProducts > plan.maxActiveProducts) {
        throw validationError(
          `Este emprendimiento tiene ${activeProducts} productos activos. ` +
            `El plan ${plan.name} permite un máximo de ` +
            `${plan.maxActiveProducts}. Desactiva los productos ` +
            "necesarios antes de cambiar el plan.",
          409
        );
      }

      if (business.planId !== planId) {
        transaction.update(businessRef, {
          planId,
        });
      }

      return {
        businessId: id,
        planId: planSnapshot.id,
        planName: plan.name,
        commissionRate: plan.commissionRate,
        maxActiveProducts: plan.maxActiveProducts,
        activeProducts,
      };
    });

    return successResponse(result);
  } catch (error) {
    return errorResponse(
      error.code || "BUSINESS_PLAN_ERROR",
      error.status ? error.message : "No se pudo cambiar el plan del emprendimiento.",
      error instanceof SyntaxError ? 400 : error.status || 503
    );
  }
}
