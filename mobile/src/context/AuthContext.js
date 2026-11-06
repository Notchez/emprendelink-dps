import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

import { authService } from "../services/authService";
import { getAuthSessionState } from "../utils/sessionState";

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
  const [sessionRecoverable, setSessionRecoverable] = useState(false);
  const sessionRevision = useRef(0);

  const applySession = useCallback((session) => {
    setIdentity(session.identity);
    setUser(session.user);
    setProfileRequired(session.profileRequired);
    setSessionError(session.sessionError || "");
    setSessionRecoverable(session.sessionRecoverable === true);
  }, []);

  const applySessionResult = useCallback((result, authenticatedIdentity = null) => {
    applySession(getAuthSessionState(result, authenticatedIdentity));
    setInitializing(false);
  }, [applySession]);

  useEffect(() => {
    let active = true;
    let unsubscribe;
    authService.subscribe((result, authenticatedIdentity) => {
      if (!active) return;
      sessionRevision.current += 1;
      applySessionResult(result, authenticatedIdentity);
    }).then((stop) => {
      if (active) unsubscribe = stop;
      else stop();
    }).catch((error) => {
      if (!active) return;
      sessionRevision.current += 1;
      setSessionError(error?.message || "No se pudo iniciar Firebase.");
      setSessionRecoverable(false);
      setInitializing(false);
    });
    return () => {
      active = false;
      if (unsubscribe) unsubscribe();
    };
  }, [applySessionResult]);

  const retrySession = useCallback(async () => {
    const revision = ++sessionRevision.current;
    setInitializing(true);
    setSessionError("");
    const result = await authService.restoreSession();
    if (revision !== sessionRevision.current) return;
    const recoverableIdentity = result.error?.code === "USER_READ_ERROR" ? identity : null;
    applySessionResult(result, recoverableIdentity);
  }, [applySessionResult, identity]);

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
    identity, user, profileRequired, initializing, loading, sessionError, sessionRecoverable,
    login, register, loginWithGoogle, completeProfile, logout, retrySession,
  }), [identity, user, profileRequired, initializing, loading, sessionError, sessionRecoverable, login, register, loginWithGoogle, completeProfile, logout, retrySession]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe utilizarse dentro de AuthProvider.");
  return context;
}
