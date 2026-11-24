export const CART_STORAGE_KEY = "emprendelink_cart";
export const CART_CHANGE_EVENT = "emprendelink-cart-change";

const CART_VERSION = 2;

export const EMPTY_CART_SERIALIZED = JSON.stringify({
  version: CART_VERSION,
  ownerUid: null,
  items: [],
  businessId: null,
});

export function parseStoredCart(serialized) {
  try {
    const parsed = JSON.parse(serialized);
    if (
      parsed?.version !== CART_VERSION ||
      !(parsed.ownerUid === null || (typeof parsed.ownerUid === "string" && parsed.ownerUid))
    ) {
      return null;
    }

    return {
      ownerUid: parsed.ownerUid,
      items: Array.isArray(parsed.items) ? parsed.items : [],
      businessId: typeof parsed.businessId === "string" ? parsed.businessId : null,
    };
  } catch {
    return null;
  }
}

export function serializeCart(cart, ownerUid) {
  return JSON.stringify({
    version: CART_VERSION,
    ownerUid: ownerUid || null,
    items: cart.items,
    businessId: cart.businessId,
  });
}

export function scopedCartSnapshot(serialized, ownerUid) {
  const cart = parseStoredCart(serialized);
  return cart && cart.ownerUid === (ownerUid || null) ? serialized : EMPTY_CART_SERIALIZED;
}

export function claimGuestCart(serialized, ownerUid) {
  const cart = parseStoredCart(serialized);
  if (!ownerUid || !cart || cart.ownerUid !== null || !cart.items.length) return null;
  return serializeCart(cart, ownerUid);
}

export function notifyCartChanged() {
  window.dispatchEvent(new Event(CART_CHANGE_EVENT));
}

export function clearStoredCart() {
  try {
    localStorage.removeItem(CART_STORAGE_KEY);
    notifyCartChanged();
  } catch (error) {
    console.error("Error al vaciar carrito local", error);
  }
}

export function claimGuestCartForAccount(ownerUid) {
  try {
    const claimed = claimGuestCart(localStorage.getItem(CART_STORAGE_KEY), ownerUid);
    if (!claimed) return;
    localStorage.setItem(CART_STORAGE_KEY, claimed);
    notifyCartChanged();
  } catch (error) {
    console.error("Error al asociar carrito a la cuenta", error);
  }
}
