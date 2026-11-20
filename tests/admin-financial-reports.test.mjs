import assert from "node:assert/strict";
import test from "node:test";

import { ORDER_STATUS } from "../src/lib/constants/orderStatus.js";
import {
  buildDeliveredDates,
  buildDeliveredSales,
  buildMonthlyCommissions,
  filterAdminOrders,
  getCommissionMonthOptions,
  getLocalDateKey,
} from "../src/utils/adminFinancialReports.js";

const businesses = [
  { id: "a", name: "Alfa", active: true },
  { id: "b", name: "Beta", active: false },
];

const orders = [
  { id: "p1", businessId: "a", status: ORDER_STATUS.DELIVERED, subtotal: 100, createdAt: "2026-11-10T18:00:00Z" },
  { id: "p2", businessId: "b", status: ORDER_STATUS.DELIVERED, subtotal: 50, createdAt: "2026-11-10T23:00:00Z" },
  { id: "p3", businessId: "a", status: ORDER_STATUS.CANCELLED, subtotal: 30, createdAt: "2026-11-10T20:00:00Z" },
  { id: "p4", businessId: "removed", status: ORDER_STATUS.DELIVERED, subtotal: 20, createdAt: "2026-10-31T23:00:00Z" },
];

const commissions = [
  { id: "c1", orderId: "p1", businessId: "a", amount: 7, createdAt: "2026-11-12T12:00:00Z" },
  { id: "c2", orderId: "p2", businessId: "b", amount: 3.5, createdAt: "2026-10-30T12:00:00Z" },
  { id: "c3", orderId: "p4", businessId: "removed", amount: 0.6, createdAt: "2026-11-20T12:00:00Z" },
];

test("las fechas de pedidos se interpretan según la zona horaria de El Salvador", () => {
  assert.equal(getLocalDateKey("2026-11-11T05:59:00Z"), "2026-11-10");
  assert.equal(getLocalDateKey("2026-11-11T06:00:00Z"), "2026-11-11");
});

test("filtros de negocio y fecha de creación funcionan juntos o por separado", () => {
  const createdFrom = "2026-11-10";
  const createdTo = "2026-11-10";
  assert.deepEqual(filterAdminOrders(orders, { businessId: "a" }).map((order) => order.id), ["p1", "p3"]);
  assert.deepEqual(filterAdminOrders(orders, { createdFrom, createdTo }).map((order) => order.id), ["p1", "p2", "p3"]);
  assert.deepEqual(filterAdminOrders(orders, { businessId: "a", createdFrom, createdTo }).map((order) => order.id), ["p1", "p3"]);
});

test("la fecha de entrega usa la comisión y descarta pedidos no entregados", () => {
  const deliveredDates = buildDeliveredDates(commissions);
  assert.deepEqual(
    filterAdminOrders(orders, { deliveredFrom: "2026-11-12", deliveredTo: "2026-11-12" }, deliveredDates).map((order) => order.id),
    ["p1"]
  );
  assert.deepEqual(
    filterAdminOrders(orders, {
      businessId: "a", createdFrom: "2026-11-10", deliveredFrom: "2026-11-12", deliveredTo: "2026-11-12",
    }, deliveredDates).map((order) => order.id),
    ["p1"]
  );
});

test("ventas totales incluyen negocios inactivos o eliminados y excluyen cancelaciones", () => {
  const result = buildDeliveredSales(orders, businesses);
  assert.equal(result.total, 170);
  assert.equal(result.count, 3);
  assert.equal(result.businesses.find((business) => business.id === "a").amount, 100);
  assert.equal(result.businesses.find((business) => business.id === "b").amount, 50);
  assert.equal(result.businesses.find((business) => business.id === "removed").name, "Negocio no disponible");
});

test("comisiones mensuales y lifetime mantienen los valores históricos", () => {
  const november = buildMonthlyCommissions(commissions, businesses, "2026-11");
  assert.equal(november.monthlyTotal, 7.6);
  assert.equal(november.lifetimeTotal, 11.1);
  assert.equal(november.count, 2);
  assert.equal(november.businesses.find((business) => business.id === "b").amount, 0);
  assert.equal(november.businesses.find((business) => business.id === "removed").amount, 0.6);
  const october = buildMonthlyCommissions(commissions, businesses, "2026-10");
  assert.equal(october.monthlyTotal, 3.5);
});

test("selector mensual incluye el mes actual y meses históricos", () => {
  const options = getCommissionMonthOptions(commissions, new Date("2026-11-20T12:00:00Z"));
  assert.equal(options[0].value, "2026-11");
  assert.ok(options.some((option) => option.value === "2026-10"));
});
