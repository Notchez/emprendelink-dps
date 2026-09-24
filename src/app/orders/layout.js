"use client";

import { DashboardShell } from "@/components/layout/DashboardShell";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import { ROLES } from "@/lib/constants/roles";

export default function Layout({ children }) {
  const { user } = useAuth();

  const section = user?.role === ROLES.ADMIN ? "admin" : "entrepreneur";

  return (
    <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.ENTREPRENEUR]}>
      <DashboardShell section={section}>{children}</DashboardShell>
    </ProtectedRoute>
  );
}
