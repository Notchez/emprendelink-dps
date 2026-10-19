import assert from "node:assert/strict";
import test from "node:test";

import { ROLES } from "../src/constants/roles.js";
import { getRootFlow, ROOT_FLOWS } from "../src/navigation/roleFlow.js";

test("una sesión ausente usa el flujo de autenticación", () => {
  assert.equal(getRootFlow(null), ROOT_FLOWS.AUTH);
});

test("CUSTOMER usa el flujo funcional de cliente", () => {
  assert.equal(getRootFlow({ role: ROLES.CUSTOMER }), ROOT_FLOWS.CUSTOMER);
});

test("ENTREPRENEUR queda fuera del flujo CUSTOMER", () => {
  assert.equal(getRootFlow({ role: ROLES.ENTREPRENEUR }), ROOT_FLOWS.ENTREPRENEUR);
});

test("ADMIN queda fuera del flujo CUSTOMER", () => {
  assert.equal(getRootFlow({ role: ROLES.ADMIN }), ROOT_FLOWS.ADMIN);
});

test("un rol desconocido falla de forma segura", () => {
  assert.equal(getRootFlow({ role: "UNKNOWN" }), ROOT_FLOWS.UNSUPPORTED);
});
