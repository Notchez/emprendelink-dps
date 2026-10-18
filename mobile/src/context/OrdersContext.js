import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { ROLES } from "../constants/roles";
import { orderService } from "../services/orderService";
import { useAuth } from "./AuthContext";

const OrdersContext = createContext(null);

export function OrdersProvider({ children }) {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    if (!user || user.role !== ROLES.CUSTOMER) {
      setOrders([]);
      setError("");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await orderService.getCustomerOrders(user.id);
      if (!result.success) throw new Error(result.error?.message);
      setOrders(result.data);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "No se pudieron cargar los pedidos.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const placeOrder = useCallback(async ({ business, items, subtotal }) => {
    if (user?.role && user.role !== ROLES.CUSTOMER) {
      throw new Error("Solo una cuenta de cliente puede confirmar pedidos.");
    }
    if (!user) throw new Error("Debes iniciar sesión para confirmar un pedido.");
    const result = await orderService.createMockOrder({ user, business, items, subtotal });
    if (!result.success) throw new Error(result.error?.message || "No se pudo crear el pedido.");
    setOrders((current) => [result.data, ...current]);
    return result.data;
  }, [user]);

  const value = useMemo(
    () => ({ orders, loading, error, refresh, placeOrder }),
    [orders, loading, error, refresh, placeOrder]
  );
  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
}

export function useOrders() {
  const context = useContext(OrdersContext);
  if (!context) throw new Error("useOrders debe utilizarse dentro de OrdersProvider.");
  return context;
}
