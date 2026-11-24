import { DashboardShell } from "@/components/layout/DashboardShell";
import ProtectedRoute from "@/components/ProtectedRoute";
import { ROLES } from "@/lib/constants/roles";
export default function Layout({ children }) {
  return (
    <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
      <DashboardShell section="admin">{children}</DashboardShell>
    </ProtectedRoute>
  );
}
