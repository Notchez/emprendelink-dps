"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { getRoleHome } from "@/lib/constants/roles";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, identity, loading, error } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const hasAccess = user?.active && (allowedRoles.length === 0 || allowedRoles.includes(user.role));
  useEffect(() => {
    if (loading || error) return;
    const next = pathname.startsWith("/checkout") ? "?next=%2Fcheckout" : "";
    if (!identity) router.replace(`/login${next}`);
    else if (!user) router.replace(`/completar-perfil${next}`);
  }, [user, identity, loading, error, router, pathname]);
  if (error)
    return (
      <p role="alert" className="container">
        {error}
      </p>
    );
  if (loading || !identity || !user)
    return (
      <p role="status" className="container">
        Comprobando sesión...
      </p>
    );
  if (!hasAccess)
    return (
      <div className="container">
        <h1>Acceso no disponible</h1>
        <p>Tu cuenta no tiene acceso a esta sección.</p>
        <Link href={getRoleHome(user.role)}>Volver a mi cuenta</Link>
      </div>
    );
  return children;
}
