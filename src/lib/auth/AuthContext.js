"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { authService, authErrorMessage } from "@/services/authService";

export const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [session, setSession] = useState({ user: null, identity: null, loading: true, error: "" });
  useEffect(() => {
    let active = true;
    let stop = () => {};
    const onError = (error) => {
      if (active)
        setSession((previous) => ({
          ...previous,
          user: null,
          loading: false,
          error: authErrorMessage(error),
        }));
    };
    Promise.resolve()
      .then(() => {
        if (!active) return;
        stop = authService.observeSession((next) => {
          if (active) setSession({ ...next, error: "" });
        }, onError);
      })
      .catch(onError);
    return () => {
      active = false;
      stop();
    };
  }, []);
  async function logout() {
    await authService.logout();
    sessionStorage.removeItem("emprendelink_last_order");
    localStorage.removeItem("user");
  }
  return (
    <AuthContext.Provider value={{ ...session, login: authService.login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  return useContext(AuthContext);
}
