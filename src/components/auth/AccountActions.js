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
  if (loading) return null;
  if (!identity) return <Link href="/login">Iniciar sesión</Link>;
  return (
    <span
      style={{ display: "inline-flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}
    >
      <Link href={user ? getRoleHome(user.role) : "/completar-perfil"}>
        {user?.name || "Completar perfil"}
      </Link>
      <button
        type="button"
        onClick={async () => {
          try {
            await logout();
            router.replace("/login");
          } catch {
            setError("No se pudo cerrar sesión.");
          }
        }}
      >
        Cerrar sesión
      </button>
      {error && <span role="alert">{error}</span>}
    </span>
  );
}
