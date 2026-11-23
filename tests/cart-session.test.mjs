import test from "node:test";
import assert from "node:assert/strict";

import {
  EMPTY_CART_SERIALIZED,
  claimGuestCart,
  parseStoredCart,
  scopedCartSnapshot,
  serializeCart,
} from "../src/utils/cartStorage.js";

const order = {
  items: [{ id: "product-1", businessId: "shop", quantity: 2, price: 5 }],
  businessId: "shop",
};

test("un carrito de cliente A nunca aparece al iniciar como cliente B", () => {
  const fromAlice = serializeCart(order, "alice");
  assert.equal(scopedCartSnapshot(fromAlice, "alice"), fromAlice);
  assert.equal(scopedCartSnapshot(fromAlice, "bob"), EMPTY_CART_SERIALIZED);
  assert.equal(scopedCartSnapshot(fromAlice, null), EMPTY_CART_SERIALIZED);
});

test("el carrito invitado no es visible dentro de una cuenta antes de asociarlo", () => {
  const guest = serializeCart(order, null);
  assert.equal(scopedCartSnapshot(guest, null), guest);
  assert.equal(scopedCartSnapshot(guest, "alice"), EMPTY_CART_SERIALIZED);

  const claimed = claimGuestCart(guest, "alice");
  assert.deepEqual(parseStoredCart(claimed)?.items, order.items);
  assert.equal(scopedCartSnapshot(claimed, "alice"), claimed);
  assert.equal(scopedCartSnapshot(claimed, "bob"), EMPTY_CART_SERIALIZED);
});

test("no transfiere artículos de otra cuenta al iniciar sesión", () => {
  const fromAlice = serializeCart(order, "alice");
  assert.equal(claimGuestCart(fromAlice, "bob"), null);
});

test("un carrito antiguo sin propietario se descarta para proteger las cuentas", () => {
  const legacy = JSON.stringify(order);
  assert.equal(scopedCartSnapshot(legacy, "alice"), EMPTY_CART_SERIALIZED);
  assert.equal(scopedCartSnapshot(legacy, null), EMPTY_CART_SERIALIZED);
  assert.equal(claimGuestCart(legacy, "bob"), null);
});

test("un almacenamiento inválido jamás devuelve artículos de otro usuario", () => {
  assert.equal(scopedCartSnapshot("{json roto", "alice"), EMPTY_CART_SERIALIZED);
  assert.equal(scopedCartSnapshot(null, "alice"), EMPTY_CART_SERIALIZED);
  assert.equal(claimGuestCart(null, "alice"), null);
});
