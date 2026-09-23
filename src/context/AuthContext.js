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
    try {
      stop = authService.observeSession((next) => {
        if (active) setSession({ ...next, error: "" });
      }, onError);
    } catch (error) {
      onError(error);
    }
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

  async function login(email, password) {
    const user = await authService.login(email, password);
    if (user) {
      setSession({ user, identity: authService.getCurrentIdentity(), loading: false, error: "" });
    }
    return user;
  }

  async function register(data) {
    const user = await authService.register(data);
    if (user) {
      setSession({ user, identity: authService.getCurrentIdentity(), loading: false, error: "" });
    }
    return user;
  }

  async function completeProfile(data) {
    const user = await authService.completeProfile(data);
    if (user) {
      setSession({ user, identity: authService.getCurrentIdentity(), loading: false, error: "" });
    }
    return user;
  }

  return (
    <AuthContext.Provider value={{ ...session, login, register, completeProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  return useContext(AuthContext);
}
