import assert from "node:assert/strict";
import test from "node:test";

import {
  buildDeliveredDates,
  buildDeliveredSales,
  buildMonthlyCommissions,
  formatMonthLabel,
  getMonthOptions,
  getSalesMonthOptions,
  getSalvadorMonthKey,
  getUtcMonthKey,
} from "../src/utils/financialReports.js";

const businesses = [
  { id: "b1", name: "Oro Verde", active: true },
  { id: "b2", name: "PowerUps Star", active: true },
];

const orders = [
  { id: "one", businessId: "b1", status: "DELIVERED", subtotal: 100, createdAt: "2026-09-15T18:00:00Z", deliveredAt: "2026-10-04T12:00:00Z" },
  { id: "two", businessId: "b2", status: "DELIVERED", subtotal: 50, createdAt: "2026-10-25T12:00:00Z" },
  { id: "three", businessId: "b1", status: "CANCELLED", subtotal: 900, createdAt: "2026-10-15T12:00:00Z" },
  { id: "four", businessId: "b2", status: "DELIVERED", subtotal: 60, createdAt: "2026-10-28T12:00:00Z", deliveredAt: "2026-11-04T12:00:00Z" },
];

const commissions = [
  { id: "c1", orderId: "one", businessId: "b1", amount: 5, createdAt: "2026-10-04T12:00:00Z", rate: 0.05 },
  { id: "c2", orderId: "two", businessId: "b2", amount: 3, createdAt: "2026-10-29T12:00:00Z", rate: 0.06 },
  { id: "c3", orderId: "four", businessId: "b2", amount: 3.6, createdAt: "2026-11-04T12:00:00Z", rate: 0.06 },
];

test("la venta se filtra por entrega, no por fecha de creación; usa comisión para fechas históricas", () => {
  const deliveredDates = buildDeliveredDates(commissions);
  const october = buildDeliveredSales(orders, businesses, { month: "2026-10", deliveredDates });
  const all = buildDeliveredSales(orders, businesses, { deliveredDates });
  assert.equal(october.count, 2);
  assert.equal(october.total, 150);
  assert.equal(all.count, 3);
  assert.equal(all.total, 210);
  assert.equal(october.businesses.find((item) => item.id === "b2").records[0].deliveredAt, "2026-10-29T12:00:00Z");
});

test("comisiones muestran el mes seleccionado y conservan un acumulado histórico independiente", () => {
  const october = buildMonthlyCommissions(commissions, businesses, "2026-10");
  const november = buildMonthlyCommissions(commissions, businesses, "2026-11");
  assert.equal(october.monthlyTotal, 8);
  assert.equal(october.count, 2);
  assert.equal(november.monthlyTotal, 3.6);
  assert.equal(october.lifetimeTotal, 11.6);
  assert.equal(november.lifetimeTotal, 11.6);
  assert.equal(october.businesses.find((item) => item.id === "b1").records[0].orderId, "one");
});

test("los meses del selector incluyen últimos doce y períodos antiguos con movimientos", () => {
  const options = getMonthOptions(["2024-06-15T12:00:00Z"], { now: new Date("2026-11-22T12:00:00Z") });
  assert.equal(options.length, 13);
  assert.equal(options[0].value, "2026-11");
  assert.equal(options[12].value, "2024-06");
  assert.equal(formatMonthLabel("2026-10"), "octubre de 2026");
  const saleMonths = getSalesMonthOptions(orders, buildDeliveredDates(commissions), { now: new Date("2026-11-22T12:00:00Z") });
  assert.equal(saleMonths[0].value, "2026-11");
  assert.equal(saleMonths.some((item) => item.value === "2026-10"), true);
});

test("las ventas de emprendedor usan mes local salvadoreño cuando UTC ya avanzó", () => {
  const deliveredAt = "2026-11-01T03:20:00Z";
  assert.equal(getUtcMonthKey(deliveredAt), "2026-11");
  assert.equal(getSalvadorMonthKey(deliveredAt), "2026-10");
  const localReport = buildDeliveredSales([
    { id: "border", businessId: "b1", status: "DELIVERED", subtotal: 20, deliveredAt },
  ], businesses, { month: "2026-10", timeZone: "America/El_Salvador" });
  assert.equal(localReport.total, 20);
  const options = getMonthOptions([], { now: new Date(deliveredAt), timeZone: "America/El_Salvador" });
  assert.equal(options[0].value, "2026-10");
});

test("negocios desactivados y negocios históricos siguen en los reportes", () => {
  const report = buildMonthlyCommissions([
    { id: "lost", orderId: "p", businessId: "negocio-eliminado", amount: 2, createdAt: "2026-10-01T10:00:00Z" },
  ], businesses, "2026-10");
  assert.equal(report.monthlyTotal, 2);
  assert.equal(report.businesses[0].name, "Negocio no disponible");
  assert.equal(report.businesses.find((item) => item.id === "b1").count, 0);
});
