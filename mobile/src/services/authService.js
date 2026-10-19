import { demoCredentials, mockUsers } from "../data/mockData";
import { failure, success, wait } from "./serviceResponse";

const accounts = new Map([
  [demoCredentials.email, { password: demoCredentials.password, user: { ...mockUsers[0] } }],
]);

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

export const authService = {
  async login({ email, password }) {
    await wait();
    const account = accounts.get(normalizeEmail(email));
    if (!account || account.password !== password) {
      return failure("INVALID_CREDENTIALS", "Correo o contraseña incorrectos.");
    }
    if (!account.user.active) return failure("ACCOUNT_DISABLED", "Esta cuenta está desactivada.");
    return success({ ...account.user });
  },

  async register(values) {
    await wait(650);
    const email = normalizeEmail(values.email);
    if (accounts.has(email)) return failure("EMAIL_IN_USE", "Ya existe una cuenta con este correo.");

    const user = {
      id: `usr_mock_${Date.now()}`,
      name: String(values.name).trim(),
      email,
      role: values.role,
      phone: String(values.phone || "").trim(),
      address: String(values.address || "").trim(),
      deliveryInstructions: String(values.deliveryInstructions || "").trim(),
      createdAt: new Date().toISOString(),
      active: true,
    };
    accounts.set(email, { password: values.password, user });
    return success({ ...user });
  },

  async logout() {
    await wait(200);
    return success(null);
  },
};
