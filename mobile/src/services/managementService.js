import { createApiClient } from "./apiClient.js";
import { authService } from "./authService.js";
import { failure, success } from "./serviceResponse.js";

function loadFirestoreDependencies() {
  const firestore = require("firebase/firestore");
  const { getFirebaseDb } = require("../lib/firebase/client.js");
  return { ...firestore, db: getFirebaseDb() };
}

const mapDocs = (snapshot) => snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
const message = (error) => error?.message || "No se pudo completar la operación.";
const clean = (value) => String(value ?? "").trim();

export function normalizeSlug(value) {
  return clean(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function validatePlan(values) {
  const id = clean(values.id).toLowerCase();
  const name = clean(values.name);
  const maxActiveProducts = Number(values.maxActiveProducts);
  const percentage = Number(values.commissionRate);
  if (!/^[a-z0-9-]+$/.test(id)) throw new Error("El identificador solo admite minúsculas, números y guiones.");
  if (name.length < 2) throw new Error("El nombre del plan requiere al menos dos caracteres.");
  if (!Number.isInteger(maxActiveProducts) || maxActiveProducts < 1) throw new Error("El límite de productos debe ser un entero positivo.");
  if (clean(values.commissionRate) === "" || !Number.isFinite(percentage) || percentage < 0 || percentage > 100) {
    throw new Error("La comisión debe estar entre 0 y 100 %.");
  }
  return { id, name, maxActiveProducts, commissionRate: percentage / 100, active: values.active !== false };
}

function validateBusiness(values) {
  const name = clean(values.name);
  const slug = normalizeSlug(values.slug || name);
  const logoUrl = clean(values.logoUrl);
  if (name.length < 2) throw new Error("Ingresa el nombre de tu emprendimiento.");
  if (!slug) throw new Error("La dirección del catálogo es obligatoria.");
  if (logoUrl && !/^https?:\/\//i.test(logoUrl)) throw new Error("El logotipo necesita una URL HTTP o HTTPS.");
  return { name, slug, logoUrl: logoUrl || null };
}

function validateProduct(values) {
  const name = clean(values.name);
  const description = clean(values.description);
  const categoryId = clean(values.categoryId);
  const price = Number(values.price);
  const imageUrl = clean(values.imageUrl);
  if (!categoryId) throw new Error("Selecciona una categoría.");
  if (!name || !description) throw new Error("Completa el nombre y la descripción.");
  if (!clean(values.price) || !Number.isFinite(price) || price < 0) throw new Error("Ingresa un precio válido.");
  return { categoryId, name, description, price: Math.round(price * 100) / 100, imageUrl: imageUrl || null };
}

export function createManagementService({ loadDependencies = loadFirestoreDependencies, client = createApiClient({ getToken: () => authService.getIdToken() }) } = {}) {
  async function firestoreRead(operation) {
    try { return success(await operation(await loadDependencies())); }
    catch (error) { return failure("MANAGEMENT_READ_ERROR", message(error)); }
  }
  async function firestoreWrite(operation) {
    try { return success(await operation(await loadDependencies())); }
    catch (error) { return failure("MANAGEMENT_WRITE_ERROR", message(error)); }
  }
  async function list(name, businessId = "") {
    return firestoreRead(async ({ db, collection, getDocs, query, where }) => {
      const ref = collection(db, name);
      const snapshot = await getDocs(businessId ? query(ref, where("businessId", "==", businessId)) : ref);
      return mapDocs(snapshot);
    });
  }
  async function getOwnerBusiness(ownerId) {
    return firestoreRead(async ({ db, collection, getDocs, query, where, limit }) => {
      const snapshot = await getDocs(query(collection(db, "businesses"), where("ownerId", "==", ownerId), limit(1)));
      return mapDocs(snapshot)[0] || null;
    });
  }
  async function getOrders(businessId) {
    return client.request(`/api/orders${businessId ? `?businessId=${encodeURIComponent(businessId)}` : ""}`);
  }
  async function getCommissions(businessId) {
    return client.request(`/api/commissions${businessId ? `?businessId=${encodeURIComponent(businessId)}` : ""}`);
  }
  async function verifyUniqueSlug(dependencies, slug, exceptId) {
    const { db, collection, getDocs, query, where } = dependencies;
    const snapshot = await getDocs(query(collection(db, "businesses"), where("slug", "==", slug)));
    if (snapshot.docs.some((doc) => doc.id !== exceptId)) throw new Error("La dirección del catálogo ya está utilizada.");
  }
  return {
    list, getOwnerBusiness, getOrders, getCommissions,
    async saveBusiness(ownerId, current, values) {
      return firestoreWrite(async (deps) => {
        const { db, collection, addDoc, doc, updateDoc } = deps;
        const fields = validateBusiness(values);
        await verifyUniqueSlug(deps, fields.slug, current?.id);
        if (current?.id) {
          await updateDoc(doc(db, "businesses", current.id), fields);
          return { ...current, ...fields };
        }
        const planId = clean(values.planId);
        if (!planId) throw new Error("Selecciona un plan activo.");
        const existing = await getOwnerBusiness(ownerId);
        if (!existing.success) throw new Error(existing.error.message);
        if (existing.data) throw new Error("Ya tienes un emprendimiento registrado.");
        const payload = { ...fields, ownerId, planId, active: true };
        const ref = await addDoc(collection(db, "businesses"), payload);
        return { id: ref.id, ...payload };
      });
    },
    async createCategory(businessId, name) {
      return firestoreWrite(async ({ db, collection, getDocs, query, where, addDoc }) => {
        const normalized = clean(name);
        if (!normalized) throw new Error("Ingresa el nombre de la categoría.");
        const existing = await getDocs(query(collection(db, "categories"), where("businessId", "==", businessId)));
        if (mapDocs(existing).some((item) => item.name.toLowerCase() === normalized.toLowerCase())) throw new Error("La categoría ya existe.");
        const payload = { businessId, name: normalized, active: true };
        const ref = await addDoc(collection(db, "categories"), payload);
        return { id: ref.id, ...payload };
      });
    },
    async updateCategory(category, changes) {
      return firestoreWrite(async ({ db, doc, updateDoc, getDocs, query, collection, where }) => {
        const fields = {};
        if (changes.name !== undefined) {
          fields.name = clean(changes.name);
          if (!fields.name) throw new Error("El nombre de la categoría es obligatorio.");
          const snapshot = await getDocs(query(collection(db, "categories"), where("businessId", "==", category.businessId)));
          const duplicate = mapDocs(snapshot).some((item) => item.id !== category.id && item.name.toLowerCase() === fields.name.toLowerCase());
          if (duplicate) throw new Error("Ya existe una categoría con ese nombre.");
        }
        if (typeof changes.active === "boolean") fields.active = changes.active;
        await updateDoc(doc(db, "categories", category.id), fields);
        return { ...category, ...fields };
      });
    },
    async saveProduct(businessId, current, values) {
      return firestoreWrite(async ({ db, doc, updateDoc, addDoc, collection, getDoc }) => {
        const fields = validateProduct(values);
        const category = await getDoc(doc(db, "categories", fields.categoryId));
        if (!category.exists() || category.data().businessId !== businessId) throw new Error("La categoría no pertenece a tu emprendimiento.");
        if (current?.id) {
          await updateDoc(doc(db, "products", current.id), fields);
          return { ...current, ...fields };
        }
        const payload = { ...fields, businessId, active: false };
        const ref = await addDoc(collection(db, "products"), payload);
        return { id: ref.id, ...payload };
      });
    },
    async setProductActive(product, active, maxActiveProducts) {
      return firestoreWrite(async ({ db, doc, updateDoc, getDocs, query, collection, where }) => {
        if (active) {
          const snapshot = await getDocs(query(collection(db, "products"), where("businessId", "==", product.businessId)));
          const count = mapDocs(snapshot).filter((item) => item.active && item.id !== product.id).length;
          if (!Number.isInteger(maxActiveProducts) || count >= maxActiveProducts) throw new Error("Alcanzaste el límite de productos activos de tu plan.");
        }
        await updateDoc(doc(db, "products", product.id), { active });
        return { ...product, active };
      });
    },
    async savePlan(current, values) {
      return firestoreWrite(async ({ db, doc, getDoc, setDoc, updateDoc }) => {
        const normalized = validatePlan({ ...values, id: current?.id || values.id });
        const ref = doc(db, "plans", normalized.id);
        const payload = { name: normalized.name, maxActiveProducts: normalized.maxActiveProducts, commissionRate: normalized.commissionRate, active: normalized.active };
        if (current?.id) await updateDoc(ref, payload);
        else {
          if ((await getDoc(ref)).exists()) throw new Error("El plan ya existe.");
          await setDoc(ref, payload);
        }
        return normalized;
      });
    },
    async setPlanActive(plan, active) {
      return firestoreWrite(async ({ db, doc, updateDoc }) => {
        await updateDoc(doc(db, "plans", plan.id), { active });
        return { ...plan, active };
      });
    },
    async setBusinessActive(business, active) {
      return firestoreWrite(async ({ db, doc, updateDoc }) => {
        await updateDoc(doc(db, "businesses", business.id), { active });
        return { ...business, active };
      });
    },
    changeBusinessPlan(businessId, planId) {
      return client.request(`/api/admin/businesses/${encodeURIComponent(businessId)}/plan`, { method: "PATCH", body: JSON.stringify({ planId }) });
    },
    setCustomerActive(customerId, active) {
      return client.request(`/api/admin/users/${encodeURIComponent(customerId)}/status`, { method: "PATCH", body: JSON.stringify({ active }) });
    },
    setOrderStatus(orderId, status) {
      return client.request(`/api/orders/${encodeURIComponent(orderId)}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
    },
    getOrderDetail(orderId) {
      return client.request(`/api/orders/${encodeURIComponent(orderId)}`);
    },
    getOrderHistory(orderId) {
      return client.request(`/api/orders/${encodeURIComponent(orderId)}/history`);
    },
  };
}

export const managementService = createManagementService();
