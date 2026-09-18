import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";

const CATEGORIES_COLLECTION = "categories";

function requireText(value, fieldName) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`El campo ${fieldName} es obligatorio.`);
  }

  return value.trim();
}

function normalizeName(name) {
  return name.trim().toLocaleLowerCase("es");
}

function mapCategory(documentSnapshot) {
  return {
    id: documentSnapshot.id,
    ...documentSnapshot.data(),
  };
}

async function getById(categoryId) {
  const validCategoryId = requireText(categoryId, "categoryId");
  const categoryReference = doc(getFirebaseDb(), CATEGORIES_COLLECTION, validCategoryId);

  const snapshot = await getDoc(categoryReference);

  if (!snapshot.exists()) {
    return null;
  }

  return mapCategory(snapshot);
}

async function getByBusinessId(businessId) {
  const validBusinessId = requireText(businessId, "businessId");

  const categoriesQuery = query(
    collection(getFirebaseDb(), CATEGORIES_COLLECTION),
    where("businessId", "==", validBusinessId)
  );

  const snapshot = await getDocs(categoriesQuery);

  return snapshot.docs.map(mapCategory).sort((first, second) =>
    first.name.localeCompare(second.name, "es", {
      sensitivity: "base",
    })
  );
}

async function create({ businessId, name }) {
  const validBusinessId = requireText(businessId, "businessId");
  const validName = requireText(name, "name");

  const existingCategories = await getByBusinessId(validBusinessId);
  const duplicatedCategory = existingCategories.some(
    (category) => normalizeName(category.name) === normalizeName(validName)
  );

  if (duplicatedCategory) {
    throw new Error("Ya existe una categoría con ese nombre.");
  }

  const category = {
    businessId: validBusinessId,
    name: validName,
    active: true,
  };

  const categoryReference = await addDoc(
    collection(getFirebaseDb(), CATEGORIES_COLLECTION),
    category
  );

  return {
    id: categoryReference.id,
    ...category,
  };
}

async function updateName(categoryId, name) {
  const validCategoryId = requireText(categoryId, "categoryId");
  const validName = requireText(name, "name");
  const currentCategory = await getById(validCategoryId);

  if (!currentCategory) {
    throw new Error("La categoría no existe.");
  }

  const businessCategories = await getByBusinessId(currentCategory.businessId);

  const duplicatedCategory = businessCategories.some(
    (category) =>
      category.id !== validCategoryId && normalizeName(category.name) === normalizeName(validName)
  );

  if (duplicatedCategory) {
    throw new Error("Ya existe una categoría con ese nombre.");
  }

  const categoryReference = doc(getFirebaseDb(), CATEGORIES_COLLECTION, validCategoryId);

  await updateDoc(categoryReference, {
    name: validName,
  });

  return {
    ...currentCategory,
    name: validName,
  };
}

async function setActive(categoryId, active) {
  const validCategoryId = requireText(categoryId, "categoryId");

  if (typeof active !== "boolean") {
    throw new Error("El estado de la categoría debe ser verdadero o falso.");
  }

  const currentCategory = await getById(validCategoryId);

  if (!currentCategory) {
    throw new Error("La categoría no existe.");
  }

  const categoryReference = doc(getFirebaseDb(), CATEGORIES_COLLECTION, validCategoryId);

  await updateDoc(categoryReference, {
    active,
  });

  return {
    ...currentCategory,
    active,
  };
}

export const categoryService = {
  getById,
  getByBusinessId,
  create,
  updateName,
  setActive,
};
