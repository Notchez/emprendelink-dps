import { Suspense } from "react";
import { AccountForm } from "@/components/auth/AccountForm";
export default function Page() {
  return (
    <Suspense fallback={<p>Cargando...</p>}>
      <AccountForm mode="login" />
    </Suspense>
  );
}
