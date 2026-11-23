import assert from "node:assert/strict";
import test from "node:test";

import { createManagementService, normalizeSlug, validatePlan } from "../src/services/managementService.js";

test("el slug móvil sigue la normalización de la web", () => {
  assert.equal(normalizeSlug("  ¡Artesanías   Señorita Luna!  "), "artesanias-senorita-luna");
  assert.equal(normalizeSlug("Oro Verde"), "oro-verde");
});

test("la tasa de un plan se guarda como decimal entre cero y uno", () => {
  assert.deepEqual(validatePlan({ id: "PLAN-PRO", name: "Pro", maxActiveProducts: "30", commissionRate: "5" }), {
    id: "plan-pro", name: "Pro", maxActiveProducts: 30, commissionRate: 0.05, active: true,
  });
  assert.throws(() => validatePlan({ id: "pro", name: "Pro", maxActiveProducts: "5", commissionRate: "-1" }), /comisión/);
  assert.throws(() => validatePlan({ id: "pro", name: "Pro", maxActiveProducts: "0", commissionRate: "5" }), /límite/);
});

test("plan nuevo guarda únicamente los campos admitidos, sin correo ni datos de usuario", async () => {
  const writes = [];
  const service = createManagementService({
    loadDependencies: () => ({
      db: {}, doc: (...args) => args.slice(1), getDoc: async () => ({ exists: () => false }),
      setDoc: async (ref, fields) => writes.push({ ref, fields }),
    }),
  });
  const result = await service.savePlan(null, { id: "pro", name: "Pro", maxActiveProducts: 20, commissionRate: 3, email: "no-guardar@test.com" });
  assert.equal(result.success, true);
  assert.deepEqual(writes[0], {
    ref: ["plans", "pro"],
    fields: { name: "Pro", maxActiveProducts: 20, commissionRate: 0.03, active: true },
  });
});

test("móvil consulta pedidos propios de emprendedor y pedidos generales de admin", async () => {
  const paths = [];
  const service = createManagementService({ client: { request: async (path) => { paths.push(path); return { success: true, data: [] }; } } });
  await service.getOrders("business 1");
  await service.getOrders("");
  await service.getCommissions("business 1");
  assert.deepEqual(paths, ["/api/orders?businessId=business%201", "/api/orders", "/api/commissions?businessId=business%201"]);
});

test("cambio de estado y plan usa endpoints con protección del servidor", async () => {
  const requests = [];
  const service = createManagementService({ client: { request: async (path, options) => { requests.push({ path, options }); return { success: true, data: {} }; } } });
  await service.setCustomerActive("cliente-1", false);
  await service.changeBusinessPlan("empresa-1", "plan-pro");
  await service.setOrderStatus("pedido-1", "CONFIRMED");
  assert.deepEqual(requests.map((item) => item.path), [
    "/api/admin/users/cliente-1/status", "/api/admin/businesses/empresa-1/plan", "/api/orders/pedido-1/status",
  ]);
  requests.forEach((item) => assert.equal(item.options.method, "PATCH"));
  assert.deepEqual(JSON.parse(requests[2].options.body), { status: "CONFIRMED" });
});
