import "server-only";

import { getAdminDb } from "@/lib/firebase/admin";
import { requireSession } from "@/lib/auth/server";
import { ROLES } from "@/lib/constants/roles";
import { errorResponse, successResponse } from "@/utils/apiResponse";

function createError(code, message, status) {
  const error = new Error(message);

  error.code = code;
  error.status = status;

  return error;
}

function validUserId(id) {
  return typeof id === "string" && id.trim().length > 0 && !id.includes("/");
}

export async function PATCH(request, context) {
  try {
    // Solo un administrador puede cambiar
    // el estado de una cuenta.
    const session = await requireSession(request, [ROLES.ADMIN]);

    const { id } = await context.params;
    const body = await request.json();

    if (!validUserId(id)) {
      throw createError("INVALID_USER_ID", "El identificador del usuario no es válido.", 400);
    }

    if (typeof body?.active !== "boolean") {
      throw createError(
        "INVALID_ACCOUNT_STATUS",
        "Selecciona un estado válido para la cuenta.",
        400
      );
    }

    // Evitamos que un administrador modifique
    // su propia cuenta desde esta operación.
    if (id === session.user.id) {
      throw createError(
        "SELF_UPDATE_NOT_ALLOWED",
        "No puedes cambiar el estado de tu propia cuenta.",
        403
      );
    }

    const db = getAdminDb();
    const userRef = db.collection("users").doc(id);

    const result = await db.runTransaction(async (transaction) => {
      const userSnapshot = await transaction.get(userRef);

      if (!userSnapshot.exists) {
        throw createError("USER_NOT_FOUND", "No se encontró el usuario.", 404);
      }

      const user = userSnapshot.data();

      // Esta pantalla administra únicamente clientes.
      // No permite desactivar administradores ni
      // emprendedores por medio de esta ruta.
      if (user.role !== ROLES.CUSTOMER) {
        throw createError(
          "CUSTOMER_REQUIRED",
          "Esta operación solo permite administrar cuentas de clientes.",
          403
        );
      }

      if (user.active !== body.active) {
        transaction.update(userRef, {
          active: body.active,
        });
      }

      return {
        id: userSnapshot.id,
        name: user.name || "Cliente",
        active: body.active,
      };
    });

    return successResponse(result);
  } catch (error) {
    return errorResponse(
      error.code || "CUSTOMER_STATUS_ERROR",
      error.status ? error.message : "No se pudo actualizar el estado del cliente.",
      error instanceof SyntaxError ? 400 : error.status || 503
    );
  }
}
