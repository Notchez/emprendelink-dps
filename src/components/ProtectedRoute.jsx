"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  const hasAccess = allowedRoles.length === 0 || allowedRoles.includes(user?.role);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (!hasAccess) {
        router.push("/unauthorized");
      }
    }
  }, [user, loading, router, hasAccess]);

  if (loading || !user) {
    return <p style={{ textAlign: "center", marginTop: "50px" }}>Cargando...</p>;
  }

  return children;
}
