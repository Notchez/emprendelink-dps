import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { authService } from "../services/authService";

const AuthContext = createContext(null);

function unwrap(result) {
  if (!result.success) throw new Error(result.error?.message || "No se pudo completar la operación.");
  return result.data;
}

export function AuthProvider({ children }) {
  const [identity, setIdentity] = useState(null);
  const [user, setUser] = useState(null);
  const [profileRequired, setProfileRequired] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [loading, setLoading] = useState(false);
  const [sessionError, setSessionError] = useState("");

  const applySession = useCallback((session) => {
    setIdentity(session.identity);
    setUser(session.user);
    setProfileRequired(session.profileRequired);
    setSessionError("");
  }, []);

  useEffect(() => {
    let active = true;
    let unsubscribe;
    authService.subscribe((result) => {
      if (!active) return;
      if (result.success) applySession(result.data);
      else {
        setIdentity(null);
        setUser(null);
        setProfileRequired(false);
        setSessionError(result.error?.message || "No se pudo restaurar la sesión.");
      }
      setInitializing(false);
    }).then((stop) => { unsubscribe = stop; }).catch((error) => {
      if (!active) return;
      setSessionError(error?.message || "No se pudo iniciar Firebase.");
      setInitializing(false);
    });
    return () => {
      active = false;
      if (unsubscribe) unsubscribe();
    };
  }, [applySession]);

  const runAuthAction = useCallback(async (action) => {
    setLoading(true);
    setSessionError("");
    try {
      const session = unwrap(await action());
      applySession(session);
      return session;
    } finally {
      setLoading(false);
    }
  }, [applySession]);

  const login = useCallback((values) => runAuthAction(() => authService.login(values)), [runAuthAction]);
  const register = useCallback((values) => runAuthAction(() => authService.register(values)), [runAuthAction]);
  const loginWithGoogle = useCallback(() => runAuthAction(() => authService.loginWithGoogle()), [runAuthAction]);
  const completeProfile = useCallback((values) => runAuthAction(() => authService.completeProfile(values)), [runAuthAction]);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      unwrap(await authService.logout());
      applySession({ identity: null, user: null, profileRequired: false });
    } finally {
      setLoading(false);
    }
  }, [applySession]);

  const value = useMemo(() => ({
    identity, user, profileRequired, initializing, loading, sessionError,
    login, register, loginWithGoogle, completeProfile, logout,
  }), [identity, user, profileRequired, initializing, loading, sessionError, login, register, loginWithGoogle, completeProfile, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe utilizarse dentro de AuthProvider.");
  return context;
}
