import ProtectedRoute from "@/components/ProtectedRoute";
import { ROLES } from "@/lib/constants/roles";
export default function Layout({ children }) {
  return <ProtectedRoute allowedRoles={[ROLES.CUSTOMER]}>{children}</ProtectedRoute>;
}
