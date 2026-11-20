import assert from "node:assert/strict";
import test from "node:test";

import { matchesOrderSearch } from "../src/utils/orderSearch.js";

const order = {
  id: "pedido-123ABC",
  customerId: "cliente-uno",
  customer: { name: "José Martínez", email: "jose@test.com", phone: "7123-4567" },
};

test("buscar pedidos admite nombre sin tildes, correo, teléfono e ID", () => {
  assert.equal(matchesOrderSearch(order, "jose"), true);
  assert.equal(matchesOrderSearch(order, "MARTINEZ"), true);
  assert.equal(matchesOrderSearch(order, "jose@test"), true);
  assert.equal(matchesOrderSearch(order, "7123"), true);
  assert.equal(matchesOrderSearch(order, "123abc"), true);
  assert.equal(matchesOrderSearch(order, "cliente-uno"), true);
  assert.equal(matchesOrderSearch(order, "otra persona"), false);
});
