"use client";

import { useCallback, useEffect, useState } from "react";

import { orderService } from "@/services/orderService";

export function useOrders(businessId) {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await orderService.getOrders({
        businessId,
        status: statusFilter,
        search,
      });

      setOrders(data);
      setError("");
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, [businessId, statusFilter, search]);

  useEffect(() => {
    let active = true;

    orderService
      .getOrders({
        businessId,
        status: statusFilter,
        search,
      })
      .then((data) => {
        if (!active) return;

        setOrders(data);
        setError("");
      })
      .catch((loadError) => {
        if (active) {
          setError(loadError.message);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [businessId, statusFilter, search]);

  function changeStatusFilter(status) {
    setLoading(true);
    setStatusFilter(status);
  }

  function changeSearch(value) {
    setLoading(true);
    setSearch(value);
  }

  return {
    orders,
    statusFilter,
    search,
    loading,
    error,
    setStatusFilter: changeStatusFilter,
    setSearch: changeSearch,
    refresh,
  };
}
