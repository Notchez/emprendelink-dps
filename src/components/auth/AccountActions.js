"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";
import { getRoleHome } from "@/lib/constants/roles";

export function AccountActions() {
  const { user, identity, loading, logout } = useAuth();
  const router = useRouter();

  const [error, setError] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  if (loading) return null;

  if (!identity) {
    return (
      <div className="accountActions">
        <Link className="accountNameLink" href="/login">
          Iniciar sesión
        </Link>
      </div>
    );
  }

  const displayName = user?.name || "Completar perfil";
  const firstName = displayName.trim().split(" ")[0] || "Usuario";
  const initial = firstName.charAt(0).toUpperCase();

  async function handleLogout() {
    setLoggingOut(true);
    setError("");

    try {
      await logout();
      router.replace("/login");
    } catch {
      setError("No se pudo cerrar sesión.");
      setLoggingOut(false);
    }
  }

  return (
    <div className="accountActions">
      <Link className="accountNameLink" href={user ? getRoleHome(user.role) : "/completar-perfil"}>
        <span className="accountNameBadge" aria-hidden="true">
          {initial}
        </span>

        <span className="accountNameText">
          <small>Hola</small>
          <strong>{displayName}</strong>
        </span>
      </Link>

      <button
        className="logoutActionButton"
        type="button"
        onClick={handleLogout}
        disabled={loggingOut}
      >
        <i className="bi bi-box-arrow-right" aria-hidden="true"></i>

        <span className="logoutText">{loggingOut ? "Saliendo..." : "Cerrar sesión"}</span>
      </button>

      {error && (
        <span className="accountActionError" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
