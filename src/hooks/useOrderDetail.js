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

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [orderData, historyData] = await Promise.all([
        orderService.getOrder(orderId),
        orderStatusService.getHistory(orderId),
      ]);

      setOrder(orderData);
      setHistory(historyData);
      setError("");
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    let active = true;

    Promise.all([orderService.getOrder(orderId), orderStatusService.getHistory(orderId)])
      .then(([orderData, historyData]) => {
        if (!active) return;

        setOrder(orderData);
        setHistory(historyData);
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
  }, [orderId]);

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
    refresh,
  };
}
