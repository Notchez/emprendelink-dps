export function createEmptyCartState() {
  return { items: [], business: null };
}

function withCartInvariant(items, business) {
  return {
    items,
    business: items.length === 0 ? null : business,
  };
}

export function canAddCartItem(state, selectedBusiness) {
  return !state.business || state.business.id === selectedBusiness.id;
}

export function addCartItem(state, product, selectedBusiness, quantity = 1) {
  if (!canAddCartItem(state, selectedBusiness)) return state;

  const safeQuantity = Math.min(99, Math.max(1, Number(quantity) || 1));
  const existing = state.items.find((item) => item.id === product.id);
  const items = existing
    ? state.items.map((item) =>
        item.id === product.id
          ? { ...item, quantity: Math.min(99, item.quantity + safeQuantity) }
          : item
      )
    : [...state.items, { ...product, quantity: safeQuantity }];

  return withCartInvariant(items, selectedBusiness);
}

export function replaceCartWithItem(product, selectedBusiness, quantity = 1) {
  const safeQuantity = Math.min(99, Math.max(1, Number(quantity) || 1));
  return withCartInvariant([{ ...product, quantity: safeQuantity }], selectedBusiness);
}

export function updateCartItemQuantity(state, productId, quantity) {
  if (quantity < 1) {
    return withCartInvariant(
      state.items.filter((item) => item.id !== productId),
      state.business
    );
  }

  const safeQuantity = Math.min(99, Number(quantity) || 1);
  return withCartInvariant(
    state.items.map((item) =>
      item.id === productId ? { ...item, quantity: safeQuantity } : item
    ),
    state.business
  );
}

export function removeCartItem(state, productId) {
  return withCartInvariant(
    state.items.filter((item) => item.id !== productId),
    state.business
  );
}

export function clearCartState() {
  return createEmptyCartState();
}
