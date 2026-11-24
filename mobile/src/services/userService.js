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
  const { doc, getDoc, setDoc, updateDoc } = require("firebase/firestore");
  const { getFirebaseDb } = require("../lib/firebase/client.js");
  return { db: getFirebaseDb(), doc, getDoc, setDoc, updateDoc };
}

function normalizeEditableProfile(values) {
  const profile = {
    name: String(values.name || "").trim(),
    phone: String(values.phone || "").trim(),
    address: String(values.address || "").trim(),
    deliveryInstructions: String(values.deliveryInstructions || "").trim(),
  };
  if (profile.name.length < 2 || profile.name.length > 100) throw new Error("El nombre debe tener entre 2 y 100 caracteres.");
  if (!/^[+()\d\s-]+$/.test(profile.phone) || !/^\d{7,15}$/.test(profile.phone.replace(/\D/g, ""))) throw new Error("Ingresa un teléfono válido, de 7 a 15 dígitos.");
  if (profile.phone.length > 25) throw new Error("El teléfono no puede superar 25 caracteres.");
  if (profile.address.length < 5 || profile.address.length > 500) throw new Error("Ingresa una dirección de entre 5 y 500 caracteres.");
  if (profile.deliveryInstructions.length > 500) throw new Error("Las indicaciones no pueden superar 500 caracteres.");
  return profile;
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

    async update(uid, values) {
      try {
        const updates = normalizeEditableProfile(values);
        const { db, doc, updateDoc } = await loadDependencies();
        await updateDoc(doc(db, "users", uid), updates);
        return success(updates);
      } catch (error) {
        return failure("USER_UPDATE_ERROR", error?.message || "No se pudieron guardar tus datos.");
      }
    },
  };
}

export const userService = createUserService();
