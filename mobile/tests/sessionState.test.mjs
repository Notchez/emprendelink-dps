import assert from "node:assert/strict";
import test from "node:test";

import { createSessionRequestGuard, getIdentityScopeKey, identityChanged } from "../src/utils/sessionState.js";

test("una respuesta iniciada por otra identidad queda invalidada al cerrar sesión", () => {
  const guard = createSessionRequestGuard("customer_a");
  const oldRequest = guard.begin();
  guard.invalidate();
  assert.equal(guard.isCurrent(oldRequest), false);
});

test("una respuesta anterior no reemplaza la recarga más reciente del mismo usuario", () => {
  const guard = createSessionRequestGuard("customer_a");
  const firstRequest = guard.begin();
  const latestRequest = guard.begin();
  assert.equal(guard.isCurrent(firstRequest), false);
  assert.equal(guard.isCurrent(latestRequest), true);
});

test("el carrito privado se limpia al cerrar sesión o cambiar de usuario", () => {
  assert.equal(identityChanged("customer_a", null), true);
  assert.equal(identityChanged("customer_a", "customer_b"), true);
  assert.equal(identityChanged("customer_a", "customer_a"), false);
  assert.notEqual(getIdentityScopeKey({ uid: "customer_a" }), getIdentityScopeKey(null));
  assert.notEqual(getIdentityScopeKey({ uid: "customer_a" }), getIdentityScopeKey({ uid: "customer_b" }));
});
