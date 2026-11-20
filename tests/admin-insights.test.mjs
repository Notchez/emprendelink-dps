import assert from "node:assert/strict";
import test from "node:test";

import { buildAdminCommissionInsights } from "../src/utils/adminCommissionInsights.js";
import { ORDER_STATUS } from "../src/lib/constants/orderStatus.js";

test("comisiones mensuales se agrupan por negocio sin confundirlas con ventas", () => {
  const result = buildAdminCommissionInsights({
    now: new Date("2026-11-16T12:00:00Z"),
    businesses: [{ id: "b1", name: "Café" }, { id: "b2", name: "Tienda" }],
    orders: [
      { businessId: "b1", status: ORDER_STATUS.DELIVERED, subtotal: 100 },
      { businessId: "b1", status: ORDER_STATUS.PENDING, subtotal: 300 },
      { businessId: "b2", status: ORDER_STATUS.DELIVERED, subtotal: 50 },
    ],
    commissions: [
      { businessId: "b1", amount: 3, createdAt: "2026-11-08T12:00:00Z" },
      { businessId: "b2", amount: 1.5, createdAt: "2026-11-11T12:00:00Z" },
      { businessId: "b1", amount: 4, createdAt: "2026-10-28T12:00:00Z" },
    ],
  });
  assert.equal(result.totalMonthCommissions, 4.5);
  assert.equal(result.totalMonthOperations, 2);
  assert.equal(result.businesses[0].id, "b1");
  assert.equal(result.businesses[0].monthlyCommissions, 3);
  assert.equal(result.businesses[0].deliveredSales, 100);
  assert.equal(result.businesses[0].historicalCommissions, 7);
  assert.equal(result.businesses[0].trend.length, 6);
});

test("las comisiones históricas conservan el total aunque falte el emprendimiento", () => {
  const result = buildAdminCommissionInsights({
    now: new Date("2026-11-16T12:00:00Z"),
    businesses: [],
    commissions: [{ businessId: "eliminado", amount: 8.25, createdAt: "2026-11-15T12:00:00Z" }],
  });
  assert.equal(result.totalMonthCommissions, 8.25);
  assert.deepEqual(result.businesses, []);
});
