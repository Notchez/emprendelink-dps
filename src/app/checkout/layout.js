import ProtectedRoute from "@/components/ProtectedRoute";
import { CustomerShell } from "@/components/customer/CustomerShell";

import { ROLES } from "@/lib/constants/roles";

export default function CheckoutLayout({ children }) {
  return (
    <ProtectedRoute allowedRoles={[ROLES.CUSTOMER]}>
      <CustomerShell>{children}</CustomerShell>
    </ProtectedRoute>
  );
}
