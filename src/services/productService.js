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
import { categoryService } from "@/services/categoryService";

const PRODUCTS_COLLECTION = "products";

function requireText(value, fieldName) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${fieldName} es obligatorio.`);
  }

  return value.trim();
}

function normalizePrice(value) {
  if (typeof value === "string" && value.trim() === "") {
    throw new Error("El precio es obligatorio.");
  }

  const price = Number(value);

  if (!Number.isFinite(price) || price < 0) {
    throw new Error("El precio debe ser un número válido.");
  }

  return Math.round(price * 100) / 100;
}

function normalizeImageUrl(value) {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value !== "string") {
    throw new Error("La URL de la imagen no es válida.");
  }

  return value.trim() || null;
}

function mapProduct(documentSnapshot) {
  if (!documentSnapshot.exists()) {
    return null;
  }

  return {
    id: documentSnapshot.id,
    ...documentSnapshot.data(),
  };
}

async function validateCategoryForBusiness(categoryId, businessId) {
  const category = await categoryService.getById(categoryId);

  if (!category) {
    throw new Error("La categoría seleccionada no existe.");
  }

  if (category.businessId !== businessId) {
    throw new Error("La categoría no pertenece a este negocio.");
  }

  return category;
}

async function getById(productId) {
  const normalizedProductId = requireText(productId, "El ID del producto");
  const database = getFirebaseDb();

  const productSnapshot = await getDoc(doc(database, PRODUCTS_COLLECTION, normalizedProductId));

  return mapProduct(productSnapshot);
}

async function getByBusinessId(businessId) {
  const normalizedBusinessId = requireText(businessId, "El ID del negocio");

  const database = getFirebaseDb();
  const productsQuery = query(
    collection(database, PRODUCTS_COLLECTION),
    where("businessId", "==", normalizedBusinessId)
  );

  const productsSnapshot = await getDocs(productsQuery);

  return productsSnapshot.docs.map(mapProduct).sort((firstProduct, secondProduct) =>
    firstProduct.name.localeCompare(secondProduct.name, "es", {
      sensitivity: "base",
    })
  );
}

async function create({ businessId, categoryId, name, description, price, imageUrl = null }) {
  const normalizedBusinessId = requireText(businessId, "El ID del negocio");
  const normalizedCategoryId = requireText(categoryId, "La categoría");

  await validateCategoryForBusiness(normalizedCategoryId, normalizedBusinessId);

  const product = {
    businessId: normalizedBusinessId,
    categoryId: normalizedCategoryId,
    name: requireText(name, "El nombre"),
    description: requireText(description, "La descripción"),
    price: normalizePrice(price),
    imageUrl: normalizeImageUrl(imageUrl),
    active: false,
  };

  const database = getFirebaseDb();
  const productReference = await addDoc(collection(database, PRODUCTS_COLLECTION), product);

  return {
    id: productReference.id,
    ...product,
  };
}

async function update(productId, { categoryId, name, description, price }) {
  const currentProduct = await getById(productId);

  if (!currentProduct) {
    throw new Error("El producto no existe.");
  }

  const normalizedCategoryId = requireText(categoryId, "La categoría");

  await validateCategoryForBusiness(normalizedCategoryId, currentProduct.businessId);

  const changes = {
    categoryId: normalizedCategoryId,
    name: requireText(name, "El nombre"),
    description: requireText(description, "La descripción"),
    price: normalizePrice(price),
  };

  const database = getFirebaseDb();

  await updateDoc(doc(database, PRODUCTS_COLLECTION, currentProduct.id), changes);

  return {
    ...currentProduct,
    ...changes,
  };
}

async function setImageUrl(productId, imageUrl) {
  const currentProduct = await getById(productId);

  if (!currentProduct) {
    throw new Error("El producto no existe.");
  }

  const normalizedImageUrl = normalizeImageUrl(imageUrl);
  const database = getFirebaseDb();

  await updateDoc(doc(database, PRODUCTS_COLLECTION, currentProduct.id), {
    imageUrl: normalizedImageUrl,
  });

  return {
    ...currentProduct,
    imageUrl: normalizedImageUrl,
  };
}

async function setActive(productId, active, maxActiveProducts) {
  if (typeof active !== "boolean") {
    throw new Error("El estado del producto no es válido.");
  }

  const currentProduct = await getById(productId);

  if (!currentProduct) {
    throw new Error("El producto no existe.");
  }

  if (currentProduct.active === active) {
    return currentProduct;
  }

  if (active) {
    if (!Number.isInteger(maxActiveProducts) || maxActiveProducts < 0) {
      throw new Error("No se pudo determinar el límite de productos del plan.");
    }

    const businessProducts = await getByBusinessId(currentProduct.businessId);

    const activeProductsCount = businessProducts.filter((product) => product.active).length;

    if (activeProductsCount >= maxActiveProducts) {
      throw new Error(`Tu plan permite un máximo de ${maxActiveProducts} productos activos.`);
    }
  }

  const database = getFirebaseDb();

  await updateDoc(doc(database, PRODUCTS_COLLECTION, currentProduct.id), {
    active,
  });

  return {
    ...currentProduct,
    active,
  };
}

export const productService = {
  getById,
  getByBusinessId,
  create,
  update,
  setImageUrl,
  setActive,
};
