import { ROLES } from "../constants/roles.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email) {
  const value = String(email || "").trim();
  if (!value) return "El correo es obligatorio.";
  if (!EMAIL_PATTERN.test(value)) return "Escribe un correo válido.";
  return "";
}

export function validatePassword(password, { strict = false } = {}) {
  const value = String(password || "");
  if (!value) return "La contraseña es obligatoria.";
  if (strict && value.length < 8) return "Usa al menos 8 caracteres.";
  if (strict && !/[A-Za-z]/.test(value)) return "Incluye al menos una letra.";
  if (strict && !/\d/.test(value)) return "Incluye al menos un número.";
  return "";
}

export function validateLogin(values) {
  const errors = {
    email: validateEmail(values.email),
    password: validatePassword(values.password),
  };
  return Object.fromEntries(Object.entries(errors).filter(([, message]) => message));
}

export function validateRegistration(values) {
  const errors = {
    name: String(values.name || "").trim().length >= 2 ? "" : "Escribe tu nombre completo.",
    email: validateEmail(values.email),
    phone:
      values.role !== ROLES.CUSTOMER || String(values.phone || "").replace(/\D/g, "").length >= 8
        ? ""
        : "Escribe un teléfono válido.",
    address:
      values.role !== ROLES.CUSTOMER || String(values.address || "").trim().length >= 8
        ? ""
        : "Escribe una dirección más completa.",
    password: validatePassword(values.password, { strict: true }),
    confirmPassword: values.password === values.confirmPassword ? "" : "Las contraseñas no coinciden.",
  };
  return Object.fromEntries(Object.entries(errors).filter(([, message]) => message));
}

export function hasValidationErrors(errors) {
  return Object.keys(errors).length > 0;
}
