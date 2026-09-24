import "server-only";
import { normalizeProfile, validateProfile } from "@/utils/profileValidation";
import { ROLES } from "@/lib/constants/roles";

export function accessError(message, status = 403) {
  return Object.assign(new Error(message), {
    status,
    code: status === 401 ? "UNAUTHENTICATED" : "ACCESS_ERROR",
  });
}
function decodeField(value) {
  if ("stringValue" in value) return value.stringValue;
  if ("booleanValue" in value) return value.booleanValue;
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return value.doubleValue;
  if ("nullValue" in value) return null;
  if ("timestampValue" in value) return value.timestampValue;
  if ("mapValue" in value) return decodeFields(value.mapValue.fields);
  if ("arrayValue" in value) return (value.arrayValue.values || []).map(decodeField);
  return null;
}
function decodeFields(fields = {}) {
  return Object.fromEntries(
    Object.entries(fields).map(([key, value]) => [key, decodeField(value)])
  );
}
export async function readDocument(token, collection, id) {
  if (typeof id !== "string" || !id || id.includes("/"))
    throw accessError("Identificador no válido.", 400);
  const project = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!project) throw accessError("Firebase no está configurado en el servidor.", 503);
  const response = await fetch(
    `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(project)}/databases/(default)/documents/${collection}/${encodeURIComponent(id)}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    }
  );
  if (response.status === 404) return null;
  if (!response.ok)
    throw accessError(
      "No se pudo acceder a los datos de Firebase.",
      response.status === 403 ? 403 : 503
    );
  return { ...decodeFields((await response.json()).fields), id };
}

export async function requireSession(request, allowedRoles = Object.values(ROLES)) {
  const authorization = request.headers.get("authorization") || "";
  const match = /^Bearer ([^\s]+)$/.exec(authorization);
  if (!match) throw accessError("Debes iniciar sesión.", 401);
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) throw accessError("Firebase no está configurado en el servidor.", 503);
  const token = match[1];
  // Firebase validates the token. Never trust a UID or role supplied in the request body.
  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken: token }),
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    }
  );
  if (!response.ok) throw accessError("Tu sesión no es válida. Inicia sesión nuevamente.", 401);
  const account = (await response.json()).users?.[0];
  if (!account?.localId || account.disabled) throw accessError("Tu sesión no es válida.", 401);
  const profile = await readDocument(token, "users", account.localId);
  if (!profile || !profile.active || !allowedRoles.includes(profile.role))
    throw accessError("Tu cuenta no tiene permiso para realizar esta acción.");
  return { user: { ...profile, id: account.localId, email: account.email }, token };
}

export async function requireBusinessOwner(session, businessId) {
  if (session.user.role === ROLES.ADMIN) return;
  const business = await readDocument(session.token, "businesses", businessId);
  if (!business || business.ownerId !== session.user.id)
    throw accessError("No tienes acceso a los pedidos de este negocio.");
}

export async function requireOrderAccess(session, order, write = false) {
  if (!order) throw accessError("No se encontró el pedido.", 404);
  if (session.user.role === ROLES.ADMIN) return;
  if (session.user.role === ROLES.CUSTOMER) {
    if (write || order.customerId !== session.user.id)
      throw accessError("No se encontró el pedido.", 404);
    return;
  }
  await requireBusinessOwner(session, order.businessId);
}

export async function prepareOrder(session, data) {
  const profileError = validateProfile(
    normalizeProfile(session.user, session.user.email),
    ROLES.CUSTOMER
  );
  if (profileError)
    throw accessError("Completa tus datos en Mi cuenta antes de hacer un pedido.", 400);
  if (
    !data ||
    typeof data !== "object" ||
    typeof data.deliveryAddress !== "string" ||
    data.deliveryAddress.trim().length < 5 ||
    data.deliveryAddress.length > 500
  )
    throw accessError("La dirección debe tener entre 5 y 500 caracteres.", 400);
  if (data.notes != null && (typeof data.notes !== "string" || data.notes.length > 500))
    throw accessError("Las indicaciones deben tener un máximo de 500 caracteres.", 400);
  if (!Array.isArray(data.items) || data.items.length < 1 || data.items.length > 100)
    throw accessError("El pedido debe incluir entre 1 y 100 productos.", 400);
  const business = await readDocument(session.token, "businesses", data.businessId);
  if (!business?.active)
    throw accessError("El negocio no está disponible. Vuelve al catálogo del emprendimiento.", 400);
  const seen = new Set();
  const items = [];
  for (const item of data.items) {
    if (
      !item ||
      typeof item.productId !== "string" ||
      !Number.isInteger(item.quantity) ||
      item.quantity < 1 ||
      item.quantity > 999 ||
      seen.has(item.productId)
    )
      throw accessError("Hay cantidades o productos inválidos en el pedido.", 400);
    seen.add(item.productId);
    const product = await readDocument(session.token, "products", item.productId);
    if (
      !product?.active ||
      product.businessId !== business.id ||
      !Number.isFinite(product.price) ||
      product.price < 0
    )
      throw accessError("Un producto ya no está disponible. Actualiza tu carrito.", 409);
    // Recalculate using the stored price, never the browser's price.
    items.push({
      productId: product.id,
      productName: product.name,
      quantity: item.quantity,
      unitPrice: product.price,
    });
  }
  return {
    businessId: business.id,
    customerId: session.user.id,
    createdBy: session.user.id,
    customer: { name: session.user.name, phone: session.user.phone, email: session.user.email },
    items,
    deliveryAddress: data.deliveryAddress.trim(),
    notes: data.notes?.trim() || null,
  };
}
