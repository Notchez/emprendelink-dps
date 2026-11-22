import assert from "node:assert/strict";
import test from "node:test";

import { ORDER_STATUS } from "../src/lib/constants/orderStatus.js";
import {
  buildEntrepreneurSales,
  filterEntrepreneurOrders,
  filterEntrepreneurSales,
  getActiveOrders,
  totalEntrepreneurSales,
} from "../src/utils/entrepreneurReports.js";

const orders = [
  {
    id: "pending", status: ORDER_STATUS.PENDING, createdAt: "2026-11-18T15:00:00Z",
    customer: { name: "María Núñez" }, subtotal: 25, items: [{ quantity: 2 }],
  },
  {
    id: "ready", status: ORDER_STATUS.READY, createdAt: "2026-11-19T15:00:00Z",
    customer: { name: "José López" }, subtotal: 40, items: [{ quantity: 1 }],
  },
  {
    id: "cancelled", status: ORDER_STATUS.CANCELLED, createdAt: "2026-11-20T15:00:00Z",
    customer: { name: "María Núñez" }, subtotal: 80, items: [{ quantity: 4 }],
  },
  {
    id: "delivered", status: ORDER_STATUS.DELIVERED, createdAt: "2026-11-10T15:00:00Z",
    customer: { name: "María Núñez" }, subtotal: 100, items: [{ quantity: 2 }, { quantity: 1 }],
  },
  {
    id: "old-sale", status: ORDER_STATUS.DELIVERED, createdAt: "2026-10-29T15:00:00Z",
    customer: { name: "Ana Flores" }, subtotal: 50, items: [{ quantity: 1 }],
  },
];

const commissions = [
  { orderId: "delivered", createdAt: "2026-11-15T04:00:00Z" },
  { orderId: "old-sale", createdAt: "2026-10-31T15:00:00Z" },
];

test("el inicio de Emprendedor prioriza solo pedidos activos y ordena los recientes primero", () => {
  assert.deepEqual(getActiveOrders(orders).map((order) => order.id), ["ready", "pending"]);
});

test("la búsqueda por cliente ignora tildes y combina estado y fechas", () => {
  assert.deepEqual(filterEntrepreneurOrders(orders, { customerName: "maria nunez" }).map((order) => order.id), ["pending", "cancelled", "delivered"]);
  assert.deepEqual(filterEntrepreneurOrders(orders, {
    customerName: "MARIA", status: ORDER_STATUS.PENDING,
    createdFrom: "2026-11-18", createdTo: "2026-11-18",
  }).map((order) => order.id), ["pending"]);
  assert.deepEqual(filterEntrepreneurOrders(orders, {
    deliveredFrom: "2026-11-14", deliveredTo: "2026-11-14",
  }, Object.fromEntries(commissions.map(({ orderId, createdAt }) => [orderId, createdAt]))).map((order) => order.id), ["delivered"]);
});

test("ventas incluyen únicamente pedidos entregados, sin confundir venta y comisión", () => {
  const sales = buildEntrepreneurSales(orders, commissions);
  assert.deepEqual(sales.map((sale) => sale.id), ["delivered", "old-sale"]);
  assert.equal(totalEntrepreneurSales(sales), 150);
  assert.equal(sales[0].productCount, 3);
  assert.equal(sales[0].date, "2026-11-14");
  assert.equal(totalEntrepreneurSales(filterEntrepreneurSales(sales, "2026-11-01", "2026-11-30")), 100);
  assert.equal(totalEntrepreneurSales(filterEntrepreneurSales(sales, "2026-10-01", "2026-10-31")), 50);
});
