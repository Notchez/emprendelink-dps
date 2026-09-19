"use client";

import { useCallback, useEffect, useState } from "react";

import { businessService } from "@/services/businessService";
import { categoryService } from "@/services/categoryService";
import { planService } from "@/services/planService";
import { productService } from "@/services/productService";

const initialState = {
  ownerId: null,
  business: null,
  plan: null,
  categories: [],
  products: [],
  error: "",
};

function sortProducts(products) {
  return [...products].sort((firstProduct, secondProduct) =>
    firstProduct.name.localeCompare(secondProduct.name, "es", {
      sensitivity: "base",
    })
  );
}

async function fetchProductData(ownerId) {
  const business = await businessService.getByOwnerId(ownerId);

  if (!business) {
    return {
      business: null,
      plan: null,
      categories: [],
      products: [],
    };
  }

  const [plan, categories, products] = await Promise.all([
    planService.getById(business.planId),
    categoryService.getByBusinessId(business.id),
    productService.getByBusinessId(business.id),
  ]);

  return {
    business,
    plan,
    categories,
    products: sortProducts(products),
  };
}

export function useProducts(ownerId) {
  const [state, setState] = useState(initialState);

  useEffect(() => {
    if (!ownerId) {
      return undefined;
    }

    let cancelled = false;

    async function loadProductData() {
      try {
        const data = await fetchProductData(ownerId);

        if (!cancelled) {
          setState({
            ownerId,
            ...data,
            error: "",
          });
        }
      } catch (error) {
        if (!cancelled) {
          setState({
            ownerId,
            business: null,
            plan: null,
            categories: [],
            products: [],
            error: error instanceof Error ? error.message : "No se pudieron cargar los productos.",
          });
        }
      }
    }

    void loadProductData();

    return () => {
      cancelled = true;
    };
  }, [ownerId]);

  const refresh = useCallback(async () => {
    if (!ownerId) {
      return;
    }

    const data = await fetchProductData(ownerId);

    setState({
      ownerId,
      ...data,
      error: "",
    });
  }, [ownerId]);

  const isCurrentOwner = state.ownerId === ownerId;
  const business = isCurrentOwner ? state.business : null;
  const plan = isCurrentOwner ? state.plan : null;
  const categories = isCurrentOwner ? state.categories : [];
  const products = isCurrentOwner ? state.products : [];
  const error = isCurrentOwner ? state.error : "";
  const loading = Boolean(ownerId) && !isCurrentOwner;

  const createProduct = useCallback(
    async (values) => {
      if (!business) {
        throw new Error("Primero debes configurar tu emprendimiento.");
      }

      const product = await productService.create({
        businessId: business.id,
        categoryId: values.categoryId,
        name: values.name,
        description: values.description,
        price: values.price,
        imageUrl: values.imageUrl,
      });

      await refresh();

      return product;
    },
    [business, refresh]
  );

  const updateProduct = useCallback(
    async (productId, values) => {
      await productService.update(productId, {
        categoryId: values.categoryId,
        name: values.name,
        description: values.description,
        price: values.price,
      });

      await productService.setImageUrl(productId, values.imageUrl);
      await refresh();
    },
    [refresh]
  );

  const setProductActive = useCallback(
    async (productId, active) => {
      if (active && !plan) {
        throw new Error("No se encontró el plan asignado al emprendimiento.");
      }

      if (active && !plan.active) {
        throw new Error("El plan asignado no está activo.");
      }

      await productService.setActive(productId, active, plan?.maxActiveProducts ?? 0);

      await refresh();
    },
    [plan, refresh]
  );

  return {
    business,
    plan,
    categories,
    products,
    loading,
    error,
    createProduct,
    updateProduct,
    setProductActive,
    refresh,
  };
}
