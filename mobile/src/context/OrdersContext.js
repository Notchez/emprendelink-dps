import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

import { ROLES } from "../constants/roles";
import { orderService } from "../services/orderService";
import { createSessionRequestGuard } from "../utils/sessionState";
import { useAuth } from "./AuthContext";

const OrdersContext = createContext(null);

export function OrdersProvider({ children }) {
  const { identity, user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const identityId = identity?.uid ?? null;
  const requestGuard = useRef(createSessionRequestGuard(identityId));

  const refresh = useCallback(async () => {
    if (!identityId || !user || user.role !== ROLES.CUSTOMER) {
      setOrders([]);
      setError("");
      setLoading(false);
      return;
    }

    const request = requestGuard.current.begin();
    setLoading(true);
    setError("");
    try {
      const result = await orderService.getCustomerOrders();
      if (!requestGuard.current.isCurrent(request)) return;
      if (!result.success) throw new Error(result.error?.message);
      setOrders(result.data);
    } catch (failure) {
      if (!requestGuard.current.isCurrent(request)) return;
      setError(failure instanceof Error ? failure.message : "No se pudieron cargar los pedidos.");
    } finally {
      if (requestGuard.current.isCurrent(request)) setLoading(false);
    }
  }, [identityId, user]);

  useEffect(() => {
    const guard = requestGuard.current;
    return () => guard.invalidate();
  }, []);

  useEffect(() => {
    setOrders([]);
    setError("");
    setLoading(false);
    void refresh();
  }, [identityId, refresh]);

  const placeOrder = useCallback(async ({ business, items }) => {
    if (user?.role && user.role !== ROLES.CUSTOMER) {
      throw new Error("Solo una cuenta de cliente puede confirmar pedidos.");
    }
    if (!identityId || !user) throw new Error("Debes iniciar sesión para confirmar un pedido.");

    const request = requestGuard.current.begin();
    const result = await orderService.createOrder({ user, business, items });
    if (!result.success) throw new Error(result.error?.message || "No se pudo crear el pedido.");
    if (requestGuard.current.isCurrent(request)) {
      setOrders((current) => [result.data, ...current]);
    }
    return result.data;
  }, [identityId, user]);

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
