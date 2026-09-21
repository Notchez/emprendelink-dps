"use client";

import { useCallback, useEffect, useState } from "react";
import { orderService } from "@/services/orderService";

export function useOrders(businessId) {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Carga los pedidos con los filtros seleccionados.
  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await orderService.getOrders({
        businessId,
        status: statusFilter,
        search,
      });
      setOrders(data);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, [businessId, statusFilter, search]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  return {
    orders,
    statusFilter,
    search,
    loading,
    error,
    setStatusFilter,
    setSearch,
    refresh: loadOrders,
  };
}
