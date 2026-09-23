"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { OrdersView } from "@/components/orders/OrdersView";
import { useAuth } from "@/context/AuthContext";
import { businessService } from "@/services/businessService";
import { ROLES } from "@/lib/constants/roles";
export default function OrdersPage() {
  const { user } = useAuth();
  const [result, setResult] = useState(null);
  useEffect(() => {
    if (!user || user.role === ROLES.ADMIN) return;
    let active = true;
    businessService
      .getByOwnerId(user.id)
      .then((business) => {
        if (active) setResult({ uid: user.id, business });
      })
      .catch((error) => {
        if (active) setResult({ uid: user.id, error: error.message });
      });
    return () => {
      active = false;
    };
  }, [user]);
  if (user?.role === ROLES.ADMIN) return <OrdersView />;
  if (result?.uid !== user?.id) return <p>Cargando tu negocio...</p>;
  if (result.error) return <p role="alert">{result.error}</p>;
  if (!result.business)
    return (
      <p>
        Primero <Link href="/emprendedor/negocio">configura tu negocio</Link>.
      </p>
    );
  return <OrdersView businessId={result.business.id} />;
}
