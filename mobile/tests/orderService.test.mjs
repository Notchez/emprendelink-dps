import assert from "node:assert/strict";
import test from "node:test";
import { createApiClient } from "../src/services/apiClient.js";
import { createOrderService } from "../src/services/orderService.js";
import { success } from "../src/services/serviceResponse.js";

test("apiClient adjunta el Firebase ID token", async () => {
  process.env.EXPO_PUBLIC_API_BASE_URL = "https://api.example.test";
  let request;
  const client = createApiClient({ getToken: async () => success("firebase-token"), fetchImpl: async (url, options) => {
    request = { url, options };
    return { ok: true, json: async () => ({ success: true, data: [] }) };
  } });
  assert.equal((await client.request("/api/orders")).success, true);
  assert.equal(request.url, "https://api.example.test/api/orders");
  assert.equal(request.options.headers.Authorization, "Bearer firebase-token");
});

test("createOrder envía solo identificadores, cantidades y entrega", async () => {
  let captured;
  const service = createOrderService({ client: { request: async (path, options) => { captured = { path, options }; return success({ id: "order_1" }); } } });
  await service.createOrder({ user: { address: "Dirección de prueba", deliveryInstructions: "Llamar" }, business: { id: "business_1" }, items: [{ id: "product_1", name: "Producto", price: 99, quantity: 2 }] });
  const body = JSON.parse(captured.options.body);
  assert.deepEqual(body.items, [{ productId: "product_1", quantity: 2 }]);
  assert.equal("price" in body.items[0], false);
  assert.equal("subtotal" in body, false);
});

test("orderService usa endpoints protegidos para detalle e historial", async () => {
  const paths = [];
  const service = createOrderService({ client: { request: async (path) => { paths.push(path); return success([]); } } });
  await service.getOrderById("order/a");
  await service.getOrderHistory("order/a");
  assert.deepEqual(paths, ["/api/orders/order%2Fa", "/api/orders/order%2Fa/history"]);
});
