import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  updateDoc,
  where,
} from "firebase/firestore";

import { getFirebaseDb } from "@/lib/firebase/client";

const BUSINESSES_COLLECTION = "businesses";

function requireText(value, fieldName) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`El campo ${fieldName} es obligatorio.`);
  }

  return value.trim();
}

function normalizeImageUrl(value) {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value !== "string") {
    throw new Error("La URL del logotipo no es válida.");
  }

  const normalizedUrl = value.trim();

  if (!normalizedUrl) {
    return null;
  }

  let parsedUrl;

  try {
    parsedUrl = new URL(normalizedUrl);
  } catch {
    throw new Error("La URL del logotipo no es válida.");
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    throw new Error("La URL del logotipo debe utilizar HTTP o HTTPS.");
  }

  return normalizedUrl;
}

function mapBusiness(documentSnapshot) {
  return {
    id: documentSnapshot.id,
    ...documentSnapshot.data(),
  };
}

async function findFirstBusiness(constraints) {
  const businessesQuery = query(
    collection(getFirebaseDb(), BUSINESSES_COLLECTION),
    ...constraints,
    limit(1)
  );

  const snapshot = await getDocs(businessesQuery);

  if (snapshot.empty) {
    return null;
  }

  return mapBusiness(snapshot.docs[0]);
}

async function getById(businessId) {
  const validBusinessId = requireText(businessId, "businessId");

  const businessReference = doc(getFirebaseDb(), BUSINESSES_COLLECTION, validBusinessId);

  const snapshot = await getDoc(businessReference);

  if (!snapshot.exists()) {
    return null;
  }

  return mapBusiness(snapshot);
}

async function getByOwnerId(ownerId) {
  const validOwnerId = requireText(ownerId, "ownerId");

  return findFirstBusiness([where("ownerId", "==", validOwnerId)]);
}

async function getBySlug(slug) {
  const validSlug = requireText(slug, "slug");

  return findFirstBusiness([where("slug", "==", validSlug)]);
}

async function create({ ownerId, planId, name, slug, logoUrl = null }) {
  const validOwnerId = requireText(ownerId, "ownerId");
  const validPlanId = requireText(planId, "planId");
  const validName = requireText(name, "name");
  const validSlug = requireText(slug, "slug");

  const ownerBusiness = await getByOwnerId(validOwnerId);

  if (ownerBusiness) {
    throw new Error("Este usuario ya tiene un negocio registrado.");
  }

  const slugBusiness = await getBySlug(validSlug);

  if (slugBusiness) {
    throw new Error("La dirección del catálogo ya está siendo utilizada.");
  }

  const business = {
    ownerId: validOwnerId,
    name: validName,
    slug: validSlug,
    logoUrl: normalizeImageUrl(logoUrl),
    planId: validPlanId,
    active: true,
  };

  const businessReference = await addDoc(
    collection(getFirebaseDb(), BUSINESSES_COLLECTION),
    business
  );

  return {
    id: businessReference.id,
    ...business,
  };
}

async function updateProfile(businessId, { name, slug, logoUrl }) {
  const validBusinessId = requireText(businessId, "businessId");
  const validName = requireText(name, "name");
  const validSlug = requireText(slug, "slug");

  const slugBusiness = await getBySlug(validSlug);

  if (slugBusiness && slugBusiness.id !== validBusinessId) {
    throw new Error("La dirección del catálogo ya está siendo utilizada.");
  }

  const businessReference = doc(getFirebaseDb(), BUSINESSES_COLLECTION, validBusinessId);

  const changes = {
    name: validName,
    slug: validSlug,
  };

  if (logoUrl !== undefined) {
    changes.logoUrl = normalizeImageUrl(logoUrl);
  }

  await updateDoc(businessReference, changes);

  const updatedSnapshot = await getDoc(businessReference);

  return mapBusiness(updatedSnapshot);
}

export const businessService = {
  getById,
  getByOwnerId,
  getBySlug,
  create,
  updateProfile,
};
