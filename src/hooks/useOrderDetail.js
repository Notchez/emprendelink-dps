"use client";

import { useCallback, useEffect, useState } from "react";
import { orderService } from "@/services/orderService";
import { orderStatusService } from "@/services/orderStatusService";

export function useOrderDetail(orderId) {
  const [order, setOrder] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  // Carga el pedido junto con su historial.
  const loadOrder = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [orderData, historyData] = await Promise.all([
        orderService.getOrder(orderId),
        orderStatusService.getHistory(orderId),
      ]);
      setOrder(orderData);
      setHistory(historyData);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  // Actualiza el estado y refresca la información.
  async function changeStatus(status, changedBy) {
    setUpdating(true);
    setError("");

    try {
      const result = await orderStatusService.updateStatus(orderId, status, changedBy);
      setOrder(result.order);
      const historyData = await orderStatusService.getHistory(orderId);
      setHistory(historyData);
      return result;
    } catch (updateError) {
      setError(updateError.message);
      return null;
    } finally {
      setUpdating(false);
    }
  }

  return {
    order,
    history,
    loading,
    updating,
    error,
    changeStatus,
    refresh: loadOrder,
  };
}
