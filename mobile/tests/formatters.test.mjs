import assert from "node:assert/strict";
import test from "node:test";

import { formatOrderId } from "../src/utils/formatters.js";

test("el código corto del pedido coincide con la web", () => {
  assert.equal(formatOrderId("moIbeS6sS8jl5LpcajFm"), "PED-MOIBES6S");
});

test("el código de pedidos anteriores usa el mismo formato", () => {
  assert.equal(formatOrderId("order_123456789"), "PED-ORDER_12");
});
