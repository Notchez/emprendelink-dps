import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";

import { getFirebaseDb } from "@/lib/firebase/client";

const PLANS_COLLECTION = "plans";

function requirePlanId(planId) {
  if (typeof planId !== "string" || !planId.trim()) {
    throw new Error("El ID del plan es obligatorio.");
  }

  return planId.trim();
}

async function getById(planId) {
  const validPlanId = requirePlanId(planId);
  const planReference = doc(getFirebaseDb(), PLANS_COLLECTION, validPlanId);
  const planSnapshot = await getDoc(planReference);

  if (!planSnapshot.exists()) {
    return null;
  }

  return {
    id: planSnapshot.id,
    ...planSnapshot.data(),
  };
}

async function getActive() {
  const activePlansQuery = query(
    collection(getFirebaseDb(), PLANS_COLLECTION),
    where("active", "==", true)
  );

  const plansSnapshot = await getDocs(activePlansQuery);

  return plansSnapshot.docs
    .map((planSnapshot) => ({
      id: planSnapshot.id,
      ...planSnapshot.data(),
    }))
    .sort((firstPlan, secondPlan) => {
      const limitDifference = firstPlan.maxActiveProducts - secondPlan.maxActiveProducts;

      if (limitDifference !== 0) {
        return limitDifference;
      }

      return firstPlan.name.localeCompare(secondPlan.name, "es", {
        sensitivity: "base",
      });
    });
}

async function getPlans() {
  const snapshot = await getDocs(collection(getFirebaseDb(), PLANS_COLLECTION));

  return snapshot.docs
    .map((planSnapshot) => ({ id: planSnapshot.id, ...planSnapshot.data() }))
    .sort((firstPlan, secondPlan) => firstPlan.maxActiveProducts - secondPlan.maxActiveProducts);
}

function normalizePlan(data) {
  const name = typeof data.name === "string" ? data.name.trim() : "";
  const id = typeof data.id === "string" ? data.id.trim().toLowerCase() : "";
  const maxActiveProducts = Number(data.maxActiveProducts);
  const commissionRate = Number(data.commissionRate);

  if (!/^[a-z0-9-]+$/.test(id)) {
    throw new Error("El identificador solo puede contener letras minúsculas, números y guiones.");
  }
  if (name.length < 2) throw new Error("El nombre del plan debe tener al menos 2 caracteres.");
  if (!Number.isInteger(maxActiveProducts) || maxActiveProducts < 1) {
    throw new Error("El límite de productos debe ser un número entero positivo.");
  }
  if (!Number.isFinite(commissionRate) || commissionRate < 0 || commissionRate > 100) {
    throw new Error("La comisión debe estar entre 0% y 100%.");
  }

  return {
    id,
    name,
    maxActiveProducts,
    commissionRate: commissionRate / 100,
    active: data.active !== false,
  };
}

async function create(plan) {
  const normalizedPlan = normalizePlan(plan);
  const existingPlan = await getById(normalizedPlan.id);

  if (existingPlan) {
    throw new Error("Ya existe un plan con ese identificador.");
  }

  await setDoc(doc(getFirebaseDb(), PLANS_COLLECTION, normalizedPlan.id), {
    name: normalizedPlan.name,
    maxActiveProducts: normalizedPlan.maxActiveProducts,
    commissionRate: normalizedPlan.commissionRate,
    active: normalizedPlan.active,
  });

  return normalizedPlan;
}

async function update(planId, plan) {
  const validPlanId = requirePlanId(planId);
  const normalizedPlan = normalizePlan({ ...plan, id: validPlanId });

  await updateDoc(doc(getFirebaseDb(), PLANS_COLLECTION, validPlanId), {
    name: normalizedPlan.name,
    maxActiveProducts: normalizedPlan.maxActiveProducts,
    commissionRate: normalizedPlan.commissionRate,
    active: normalizedPlan.active,
  });

  return normalizedPlan;
}

async function setActive(planId, active) {
  const validPlanId = requirePlanId(planId);

  if (typeof active !== "boolean") {
    throw new Error("El estado del plan no es válido.");
  }

  await updateDoc(doc(getFirebaseDb(), PLANS_COLLECTION, validPlanId), { active });
  return { id: validPlanId, active };
}

async function seedDefaults() {
  const defaults = [
    { id: "plan-basic", name: "Básico", maxActiveProducts: 10, commissionRate: 3, active: true },
    {
      id: "plan-standard",
      name: "Estándar",
      maxActiveProducts: 30,
      commissionRate: 7,
      active: true,
    },
    {
      id: "plan-premium",
      name: "Premium",
      maxActiveProducts: 100,
      commissionRate: 5,
      active: true,
    },
  ];

  const existingPlans = await getPlans();
  const existingIds = new Set(existingPlans.map((plan) => plan.id));

  for (const plan of defaults) {
    if (!existingIds.has(plan.id)) {
      await create(plan);
    }
  }

  return getPlans();
}

export const planService = {
  getById,
  getActive,
  getPlans,
  create,
  update,
  setActive,
  seedDefaults,
};
