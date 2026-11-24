"use client";

import { useEffect, useState } from "react";

import { businessService } from "@/services/businessService";
import { planService } from "@/services/planService";
import { normalizeSlug } from "@/utils/normalizeSlug";
import { validateBusinessForm } from "@/utils/validateBusinessForm";

const initialValues = {
  name: "",
  slug: "",
  logoUrl: "",
  planId: "",
};

const initialRequest = {
  ownerId: null,
  business: null,
  plans: [],
  error: "",
};

async function fetchBusinessData(ownerId) {
  const [business, activePlans] = await Promise.all([
    businessService.getByOwnerId(ownerId),
    planService.getActive(),
  ]);

  if (!business || activePlans.some((plan) => plan.id === business.planId)) {
    return {
      business,
      plans: activePlans,
    };
  }

  const assignedPlan = await planService.getById(business.planId);

  return {
    business,
    plans: assignedPlan ? [...activePlans, assignedPlan] : activePlans,
  };
}

export function useBusinessForm(ownerId) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [request, setRequest] = useState(initialRequest);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!ownerId) {
      return undefined;
    }

    let cancelled = false;

    async function loadBusinessData() {
      try {
        const data = await fetchBusinessData(ownerId);

        if (!cancelled) {
          setValues(
            data.business
              ? {
                  name: data.business.name,
                  slug: data.business.slug,
                  logoUrl: data.business.logoUrl ?? "",
                  planId: data.business.planId,
                }
              : initialValues
          );

          setRequest({
            ownerId,
            ...data,
            error: "",
          });
        }
      } catch (error) {
        if (!cancelled) {
          setRequest({
            ownerId,
            business: null,
            plans: [],
            error:
              error instanceof Error
                ? error.message
                : "No se pudo cargar la información del negocio.",
          });
        }
      }
    }

    void loadBusinessData();

    return () => {
      cancelled = true;
    };
  }, [ownerId]);

  const isCurrentOwner = request.ownerId === ownerId;

  const business = isCurrentOwner ? request.business : null;

  const plans = isCurrentOwner ? request.plans : [];

  const loadError = isCurrentOwner ? request.error : "";

  const loading = Boolean(ownerId) && !isCurrentOwner;

  function updateField(name, value) {
    setValues((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  }

  function formatSlug() {
    setValues((previous) => ({
      ...previous,
      slug: normalizeSlug(previous.slug),
    }));
  }

  function validateForm() {
    const normalizedValues = {
      ...values,
      name: values.name.trim(),
      slug: normalizeSlug(values.slug),
      logoUrl: values.logoUrl.trim(),
    };

    const validationErrors = validateBusinessForm(normalizedValues);

    setValues(normalizedValues);
    setErrors(validationErrors);

    return {
      isValid: Object.keys(validationErrors).length === 0,
      normalizedValues,
    };
  }

  async function saveBusiness() {
    if (!ownerId) {
      throw new Error("Debes iniciar sesión para guardar el negocio.");
    }

    const { isValid, normalizedValues } = validateForm();

    if (!isValid) {
      return null;
    }

    setSaving(true);

    try {
      const savedBusiness = business
        ? await businessService.updateProfile(business.id, {
            name: normalizedValues.name,
            slug: normalizedValues.slug,
            logoUrl: normalizedValues.logoUrl,
          })
        : await businessService.create({
            ownerId,
            planId: normalizedValues.planId,
            name: normalizedValues.name,
            slug: normalizedValues.slug,
            logoUrl: normalizedValues.logoUrl,
          });

      setRequest((previous) => ({
        ...previous,
        ownerId,
        business: savedBusiness,
        error: "",
      }));

      setValues({
        name: savedBusiness.name,
        slug: savedBusiness.slug,
        logoUrl: savedBusiness.logoUrl ?? "",
        planId: savedBusiness.planId,
      });

      return savedBusiness;
    } finally {
      setSaving(false);
    }
  }

  return {
    values,
    errors,
    business,
    plans,
    loading,
    loadError,
    saving,
    updateField,
    formatSlug,
    saveBusiness,
  };
}
