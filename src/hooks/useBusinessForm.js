import { useState } from "react";
import { normalizeSlug } from "@/utils/normalizeSlug";
import { validateBusinessForm } from "@/utils/validateBusinessForm";

export function useBusinessForm() {
  const [values, setValues] = useState({
    name: "",
    slug: "",
  });

  const [errors, setErrors] = useState({});

  function updateField(name, value) {
    setValues((previous) => ({
      ...previous,
      [name]: value,
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
    };

    const validationErrors = validateBusinessForm(normalizedValues);

    setValues(normalizedValues);
    setErrors(validationErrors);

    return Object.keys(validationErrors).length === 0;
  }

  return {
    values,
    errors,
    updateField,
    formatSlug,
    validateForm,
  };
}
