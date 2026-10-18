import { useCallback, useEffect, useState } from "react";

import { catalogService } from "../services/catalogService";

export function useBusinesses() {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await catalogService.getBusinesses();
      if (!result.success) throw new Error(result.error?.message);
      setBusinesses(result.data);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "No se pudieron cargar los negocios.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { businesses, loading, error, reload: load };
}
