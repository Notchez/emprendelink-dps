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
  const result = await service.createOrder({ user: { address: "Dirección de prueba", deliveryInstructions: "Llamar" }, business: { id: "business_1", name: "Negocio real" }, items: [{ id: "product_1", name: "Producto", price: 99, quantity: 2 }] });
  const body = JSON.parse(captured.options.body);
  assert.deepEqual(body.items, [{ productId: "product_1", quantity: 2 }]);
  assert.equal("price" in body.items[0], false);
  assert.equal("subtotal" in body, false);
  assert.equal(result.data.businessName, "Negocio real");
});

test("orderService usa endpoints protegidos para detalle e historial", async () => {
  const paths = [];
  const service = createOrderService({
    client: { request: async (path) => { paths.push(path); return success(path.endsWith("/history") ? [] : { businessId: "business_1" }); } },
    catalog: { getBusinessById: async () => success({ id: "business_1", name: "Negocio real" }) },
  });
  await service.getOrderById("order/a");
  await service.getOrderHistory("order/a");
  assert.deepEqual(paths, ["/api/orders/order%2Fa", "/api/orders/order%2Fa/history"]);
});

test("lista de pedidos obtiene nombres reales sin cambiar el contrato del backend", async () => {
  const service = createOrderService({
    client: { request: async () => success([
      { id: "order_1", businessId: "business_active" },
      { id: "order_2", businessId: "business_inactive" },
    ]) },
    catalog: {
      getBusinesses: async () => success([{ id: "business_active", name: "Café Central" }]),
      getBusinessById: async (id) => success({ id, name: "Taller Histórico" }),
    },
  });
  const result = await service.getCustomerOrders();
  assert.equal(result.success, true);
  assert.deepEqual(result.data.map((order) => order.businessName), ["Café Central", "Taller Histórico"]);
});

test("detalle de pedido enriquece el negocio mediante catálogo", async () => {
  const service = createOrderService({
    client: { request: async () => success({ id: "order_1", businessId: "business_1" }) },
    catalog: { getBusinessById: async () => success({ id: "business_1", name: "Panadería Aurora" }) },
  });
  const result = await service.getOrderById("order_1");
  assert.equal(result.data.businessName, "Panadería Aurora");
});
