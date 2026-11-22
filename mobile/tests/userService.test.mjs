import assert from "node:assert/strict";
import test from "node:test";
import { createUserService } from "../src/services/userService.js";

test("userService usa el UID como documento sin duplicar id en Firestore", async () => {
  let write;
  const service = createUserService({ loadDependencies: async () => ({
    db: {},
    doc: (_db, collection, id) => ({ collection, id }),
    setDoc: async (reference, value) => { write = { reference, value }; },
  }) });
  const result = await service.create("uid_1", { name: "Ana", email: "ANA@example.test", role: "CUSTOMER", phone: "77777777", address: "Dirección válida" });
  assert.equal(result.success, true);
  assert.deepEqual(write.reference, { collection: "users", id: "uid_1" });
  assert.equal("id" in write.value, false);
  assert.equal(result.data.id, "uid_1");
});

test("userService rechaza ADMIN en el registro público", async () => {
  const service = createUserService({ loadDependencies: async () => { throw new Error("no debe escribir"); } });
  const result = await service.create("uid_admin", { name: "Admin", email: "admin@example.test", role: "ADMIN" });
  assert.equal(result.success, false);
  assert.match(result.error.message, /cliente o emprendedor/);
});

test("edición del perfil solo modifica los campos permitidos por Firestore", async () => {
  let write;
  const service = createUserService({ loadDependencies: async () => ({
    db: {},
    doc: (_db, collection, id) => ({ collection, id }),
    updateDoc: async (reference, value) => { write = { reference, value }; },
  }) });
  const result = await service.update("uid_1", {
    name: "Ana Pérez", phone: "7777-7777", address: "Mi dirección nueva", deliveryInstructions: "Portón azul",
    role: "ADMIN", active: false, email: "another@example.test",
  });
  assert.equal(result.success, true);
  assert.deepEqual(write.reference, { collection: "users", id: "uid_1" });
  assert.deepEqual(write.value, {
    name: "Ana Pérez", phone: "7777-7777", address: "Mi dirección nueva", deliveryInstructions: "Portón azul",
  });
});

test("perfil no guarda teléfono ni dirección inválidos", async () => {
  const service = createUserService({ loadDependencies: async () => { throw new Error("No debería escribir"); } });
  const result = await service.update("uid_1", { name: "Ana", phone: "123", address: "casa" });
  assert.equal(result.success, false);
  assert.match(result.error.message, /teléfono/);
});
