import { useEffect, useState } from "react";
import { businessService } from "@/services/businessService";
import { categoryService } from "@/services/categoryService";
import { validateCategoryName } from "@/utils/validateCategoryName";

function sortCategories(categories) {
  return [...categories].sort((first, second) =>
    first.name.localeCompare(second.name, "es", {
      sensitivity: "base",
    })
  );
}

function getErrorMessage(error) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Ocurrió un error inesperado.";
}

async function fetchCategoryData(ownerId) {
  const business = await businessService.getByOwnerId(ownerId);

  if (!business) {
    return {
      business: null,
      categories: [],
    };
  }

  const categories = await categoryService.getByBusinessId(business.id);

  return {
    business,
    categories,
  };
}

export function useCategories(ownerId) {
  const [loadedOwnerId, setLoadedOwnerId] = useState(null);
  const [businessId, setBusinessId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [busyCategoryId, setBusyCategoryId] = useState(null);

  const hasCurrentOwner = Boolean(ownerId) && loadedOwnerId === ownerId;

  const currentBusinessId = hasCurrentOwner ? businessId : null;
  const currentCategories = hasCurrentOwner ? categories : [];
  const currentStatus = !ownerId ? "idle" : hasCurrentOwner ? status : "loading";
  const currentError = hasCurrentOwner ? error : "";
  const currentFeedback = hasCurrentOwner ? feedback : "";

  useEffect(() => {
    if (!ownerId) {
      return undefined;
    }

    let cancelled = false;

    async function loadInitialCategories() {
      try {
        const result = await fetchCategoryData(ownerId);

        if (cancelled) {
          return;
        }

        setLoadedOwnerId(ownerId);
        setBusinessId(result.business?.id ?? null);
        setCategories(result.categories);
        setStatus(result.business ? "ready" : "missing-business");
        setError("");
        setFeedback("");
      } catch (caughtError) {
        if (cancelled) {
          return;
        }

        setLoadedOwnerId(ownerId);
        setBusinessId(null);
        setCategories([]);
        setStatus("error");
        setError(getErrorMessage(caughtError));
        setFeedback("");
      }
    }

    void loadInitialCategories();

    return () => {
      cancelled = true;
    };
  }, [ownerId]);

  function updateName(value) {
    setName(value);
    setNameError("");
    setError("");
    setFeedback("");
  }

  async function reload() {
    if (!ownerId) {
      return;
    }

    setStatus("loading");
    setError("");
    setFeedback("");

    try {
      const result = await fetchCategoryData(ownerId);

      setLoadedOwnerId(ownerId);
      setBusinessId(result.business?.id ?? null);
      setCategories(result.categories);
      setStatus(result.business ? "ready" : "missing-business");
    } catch (caughtError) {
      setLoadedOwnerId(ownerId);
      setBusinessId(null);
      setCategories([]);
      setStatus("error");
      setError(getErrorMessage(caughtError));
    }
  }

  async function createCategory() {
    const validationError = validateCategoryName(name);

    if (validationError) {
      setNameError(validationError);
      return;
    }

    if (!currentBusinessId) {
      setError("Primero debes registrar la información de tu negocio.");
      return;
    }

    setIsCreating(true);
    setError("");
    setFeedback("");

    try {
      const createdCategory = await categoryService.create({
        businessId: currentBusinessId,
        name,
      });

      setCategories((previous) => sortCategories([...previous, createdCategory]));
      setName("");
      setFeedback("Categoría creada correctamente.");
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    } finally {
      setIsCreating(false);
    }
  }

  function startEditing(category) {
    setEditingId(category.id);
    setEditingName(category.name);
    setNameError("");
    setError("");
    setFeedback("");
  }

  function cancelEditing() {
    setEditingId(null);
    setEditingName("");
  }

  async function saveCategoryName() {
    const validationError = validateCategoryName(editingName);

    if (validationError) {
      setError(validationError);
      return;
    }

    if (!editingId) {
      return;
    }

    setBusyCategoryId(editingId);
    setError("");
    setFeedback("");

    try {
      const updatedCategory = await categoryService.updateName(editingId, editingName);

      setCategories((previous) =>
        sortCategories(
          previous.map((category) =>
            category.id === updatedCategory.id ? updatedCategory : category
          )
        )
      );

      setEditingId(null);
      setEditingName("");
      setFeedback("Categoría actualizada correctamente.");
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    } finally {
      setBusyCategoryId(null);
    }
  }

  async function toggleCategory(category) {
    setBusyCategoryId(category.id);
    setError("");
    setFeedback("");

    try {
      const updatedCategory = await categoryService.setActive(category.id, !category.active);

      setCategories((previous) =>
        previous.map((currentCategory) =>
          currentCategory.id === updatedCategory.id ? updatedCategory : currentCategory
        )
      );

      setFeedback(
        updatedCategory.active
          ? "Categoría activada correctamente."
          : "Categoría desactivada correctamente."
      );
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    } finally {
      setBusyCategoryId(null);
    }
  }

  return {
    businessId: currentBusinessId,
    categories: currentCategories,
    name,
    nameError,
    editingId,
    editingName,
    status: currentStatus,
    error: currentError,
    feedback: currentFeedback,
    isCreating,
    busyCategoryId,
    updateName,
    setEditingName,
    createCategory,
    startEditing,
    cancelEditing,
    saveCategoryName,
    toggleCategory,
    reload,
  };
}
