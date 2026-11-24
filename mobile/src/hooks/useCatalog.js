import { useCallback, useEffect, useState } from "react";

import { catalogService } from "../services/catalogService";

export function useCatalog(businessId) {
  const [catalog, setCatalog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await catalogService.getCatalogByBusinessId(businessId);
      if (!result.success) throw new Error(result.error?.message);
      setCatalog(result.data);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "No se pudo cargar el catálogo.");
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    void load();
  }, [load]);

  return { catalog, loading, error, reload: load };
}
