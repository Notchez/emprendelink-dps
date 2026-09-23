import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";

import { plansMock } from "@/data/mock/plansMock";
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
  return plansMock;
}

export const planService = {
  getById,
  getActive,
  getPlans,
};
