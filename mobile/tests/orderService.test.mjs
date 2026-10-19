import assert from "node:assert/strict";
import test from "node:test";

import { ORDER_STATUS } from "../src/constants/orderStatus.js";
import { mockOrders } from "../src/data/mockData.js";
import { createOrderService } from "../src/services/orderService.js";

const noDelay = async () => {};

const customer = {
  id: "usr_test_customer",
  name: "Cliente de prueba",
  email: "cliente@prueba.test",
  phone: "7000-0000",
  address: "Dirección de prueba",
  deliveryInstructions: "Llamar al llegar",
};

const business = {
  id: "business_test",
  name: "Negocio de prueba",
  planId: "plan_growth",
};

const items = [
  {
    id: "product_test",
    name: "Producto de prueba",
    price: 3.5,
    quantity: 2,
  },
];

test("orderService recupera los pedidos iniciales del cliente", async () => {
  const service = createOrderService({ waitForDelay: noDelay });
  const result = await service.getCustomerOrders("usr_demo_customer");

  assert.equal(result.success, true);
  assert.equal(result.data.length, 2);
  assert.ok(result.data.every((order) => order.businessName));
});

test("orderService crea un pedido temporal con el contrato esperado", async () => {
  const service = createOrderService({ initialOrders: [], waitForDelay: noDelay });
  const result = await service.createMockOrder({ user: customer, business, items, subtotal: 7 });

  assert.equal(result.success, true);
  assert.equal(result.data.customerId, customer.id);
  assert.equal(result.data.status, ORDER_STATUS.PENDING);
  assert.equal(result.data.items[0].lineTotal, 7);
});

test("orderService conserva el pedido creado al volver a consultar", async () => {
  const initialCount = mockOrders.length;
  const service = createOrderService({ initialOrders: [], waitForDelay: noDelay });
  const created = await service.createMockOrder({ user: customer, business, items, subtotal: 7 });
  const refreshed = await service.getCustomerOrders(customer.id);

  assert.equal(refreshed.success, true);
  assert.equal(refreshed.data.length, 1);
  assert.equal(refreshed.data[0].id, created.data.id);
  assert.equal(mockOrders.length, initialCount, "el seed mock exportado no debe mutarse");
});
