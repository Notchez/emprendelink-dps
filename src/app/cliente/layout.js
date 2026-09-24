import ProtectedRoute from "@/components/ProtectedRoute";
import { DashboardShell } from "@/components/layout/DashboardShell";

import { ROLES } from "@/lib/constants/roles";

export default function CustomerLayout({ children }) {
  return (
    <ProtectedRoute allowedRoles={[ROLES.CUSTOMER]}>
      <DashboardShell section="customer">{children}</DashboardShell>
    </ProtectedRoute>
  );
}
