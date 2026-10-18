import { ROLES } from "../constants/roles.js";

export const ROOT_FLOWS = Object.freeze({
  AUTH: "AUTH",
  CUSTOMER: "CUSTOMER",
  ENTREPRENEUR: "ENTREPRENEUR",
  ADMIN: "ADMIN",
  UNSUPPORTED: "UNSUPPORTED",
});

export function getRootFlow(user) {
  if (!user) return ROOT_FLOWS.AUTH;
  if (user.role === ROLES.CUSTOMER) return ROOT_FLOWS.CUSTOMER;
  if (user.role === ROLES.ENTREPRENEUR) return ROOT_FLOWS.ENTREPRENEUR;
  if (user.role === ROLES.ADMIN) return ROOT_FLOWS.ADMIN;
  return ROOT_FLOWS.UNSUPPORTED;
}
