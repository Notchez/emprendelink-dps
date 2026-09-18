import { doc, getDoc } from "firebase/firestore";

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

export const planService = {
  getById,
};
