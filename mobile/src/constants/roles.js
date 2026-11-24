export const ROLES = Object.freeze({
  ADMIN: "ADMIN",
  ENTREPRENEUR: "ENTREPRENEUR",
  CUSTOMER: "CUSTOMER",
});

export const REGISTRATION_ROLES = Object.freeze([
  { value: ROLES.CUSTOMER, label: "Cliente", description: "Quiero comprar" },
  { value: ROLES.ENTREPRENEUR, label: "Emprendedor", description: "Quiero vender" },
]);

export function getRoleLabel(role) {
  if (role === ROLES.ADMIN) return "Administrador";
  return REGISTRATION_ROLES.find((option) => option.value === role)?.label ?? "Usuario";
}
