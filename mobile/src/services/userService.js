import { ROLES } from "../constants/roles.js";
import { failure, success } from "./serviceResponse.js";

const PUBLIC_ROLES = new Set([ROLES.CUSTOMER, ROLES.ENTREPRENEUR]);

function normalizeProfile(uid, values) {
  if (!PUBLIC_ROLES.has(values.role)) {
    throw new Error("El registro público solo permite cuentas de cliente o emprendedor.");
  }
  return {
    name: String(values.name || "").trim(),
    email: String(values.email || "").trim().toLowerCase(),
    role: values.role,
    phone: String(values.phone || "").trim(),
    address: String(values.address || "").trim(),
    deliveryInstructions: String(values.deliveryInstructions || "").trim(),
    createdAt: values.createdAt || new Date().toISOString(),
    active: true,
  };
}

function loadFirestoreDependencies() {
  const { doc, getDoc, setDoc } = require("firebase/firestore");
  const { getFirebaseDb } = require("../lib/firebase/client.js");
  return { db: getFirebaseDb(), doc, getDoc, setDoc };
}

export function createUserService({ loadDependencies = loadFirestoreDependencies } = {}) {
  return {
    async getById(uid) {
      try {
        const { db, doc, getDoc } = await loadDependencies();
        const snapshot = await getDoc(doc(db, "users", uid));
        return success(snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null);
      } catch (error) {
        return failure("USER_READ_ERROR", error?.message || "No se pudo consultar el perfil.");
      }
    },

    async create(uid, values) {
      try {
        const profile = normalizeProfile(uid, values);
        const { db, doc, setDoc } = await loadDependencies();
        await setDoc(doc(db, "users", uid), profile);
        return success({ id: uid, ...profile });
      } catch (error) {
        return failure("USER_CREATE_ERROR", error?.message || "No se pudo guardar el perfil.");
      }
    },
  };
}

export const userService = createUserService();
