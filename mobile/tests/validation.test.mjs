import assert from "node:assert/strict";
import test from "node:test";

import { ROLES } from "../src/constants/roles.js";
import { hasValidationErrors, validateLogin, validateRegistration } from "../src/utils/validation.js";

test("login acepta credenciales con formato válido", () => {
  assert.deepEqual(validateLogin({ email: "cliente@ejemplo.com", password: "secreto" }), {});
});

test("login informa correo y contraseña obligatorios", () => {
  const errors = validateLogin({ email: "", password: "" });
  assert.equal(errors.email, "El correo es obligatorio.");
  assert.equal(errors.password, "La contraseña es obligatoria.");
  assert.equal(hasValidationErrors(errors), true);
});

test("registro de cliente exige contacto y dirección", () => {
  const errors = validateRegistration({
    name: "Ana Martínez",
    email: "ana@ejemplo.com",
    phone: "123",
    address: "Corta",
    role: ROLES.CUSTOMER,
    password: "Demo1234",
    confirmPassword: "Demo1234",
  });
  assert.ok(errors.phone);
  assert.ok(errors.address);
});

test("registro de emprendedor no exige datos de entrega", () => {
  const errors = validateRegistration({
    name: "Luis Pérez",
    email: "luis@ejemplo.com",
    phone: "",
    address: "",
    role: ROLES.ENTREPRENEUR,
    password: "Demo1234",
    confirmPassword: "Demo1234",
  });
  assert.deepEqual(errors, {});
});

test("registro valida coincidencia de contraseñas", () => {
  const errors = validateRegistration({
    name: "Ana Martínez",
    email: "ana@ejemplo.com",
    phone: "77777777",
    address: "Colonia Escalón, San Salvador",
    role: ROLES.CUSTOMER,
    password: "Demo1234",
    confirmPassword: "Otra1234",
  });
  assert.equal(errors.confirmPassword, "Las contraseñas no coinciden.");
});
