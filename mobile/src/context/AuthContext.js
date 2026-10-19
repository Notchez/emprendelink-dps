import { createContext, useCallback, useContext, useMemo, useState } from "react";

import { authService } from "../services/authService";

const AuthContext = createContext(null);

function unwrap(result) {
  if (!result.success) throw new Error(result.error?.message || "No se pudo completar la operación.");
  return result.data;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (values) => {
    setLoading(true);
    try {
      const account = unwrap(await authService.login(values));
      setUser(account);
      return account;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (values) => {
    setLoading(true);
    try {
      const account = unwrap(await authService.register(values));
      setUser(account);
      return account;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      unwrap(await authService.logout());
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const value = useMemo(() => ({ user, loading, login, register, logout }), [user, loading, login, register, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe utilizarse dentro de AuthProvider.");
  return context;
}
