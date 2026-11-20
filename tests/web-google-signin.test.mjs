import assert from "node:assert/strict";
import test from "node:test";

import { authErrorMessage } from "../src/services/authService.js";
import { getLoginDestination, ROLES } from "../src/lib/constants/roles.js";

test("google web explica dominios, popup y conflictos de proveedor", () => {
  assert.match(authErrorMessage({ code: "auth/unauthorized-domain" }), /dominio/i);
  assert.match(authErrorMessage({ code: "auth/popup-blocked" }), /ventanas emergentes/i);
  assert.match(authErrorMessage({ code: "auth/account-exists-with-different-credential" }), /otro método/i);
});

test("se mantienen las rutas por rol y el checkout solo para clientes", () => {
  assert.equal(getLoginDestination(ROLES.ADMIN), "/admin");
  assert.equal(getLoginDestination(ROLES.ENTREPRENEUR), "/emprendedor");
  assert.equal(getLoginDestination(ROLES.CUSTOMER, "/checkout"), "/checkout");
  assert.equal(getLoginDestination(ROLES.ENTREPRENEUR, "/checkout"), "/emprendedor");
});
