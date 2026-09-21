"use client";

import { createContext, useContext, useState } from "react";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("user");

      if (savedUser) {
        try {
          return JSON.parse(savedUser);
        } catch (error) {
          console.error("Error parseando usuario guardado", error);
        }
      }
    }

    return null;
  });

  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);

    // La autenticación real se implementará después de estabilizar la integración.
    console.log("Inicio de sesión pendiente", { email, password });

    setLoading(false);
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
