export const ROLES = Object.freeze({
  ADMIN: "ADMIN",
  ENTREPRENEUR: "ENTREPRENEUR",
  CUSTOMER: "CUSTOMER",
});

export function getRoleHome(role) {
  if (role === ROLES.ADMIN) return "/admin";
  if (role === ROLES.ENTREPRENEUR) return "/emprendedor";
  return "/cliente";
}

export function getLoginDestination(role, next) {
  if (role === ROLES.CUSTOMER && next === "/checkout") return next;
  return getRoleHome(role);
}
