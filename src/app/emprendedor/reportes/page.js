"use client";

import { useEffect, useState } from "react";

import ReportFilters from "@/components/dashboard/ReportFilters";
import { useAuth } from "@/context/AuthContext";
import { businessService } from "@/services/businessService";
import { reportService } from "@/services/reportService";

export default function Page() {
  const { user } = useAuth();
  const userId = user?.id;

  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!userId) return;

    let active = true;

    async function loadReport() {
      try {
        const business = await businessService.getByOwnerId(userId);

        if (!business) {
          if (active) {
            setResult({ userId, business: null, orders: [] });
          }
          return;
        }

        const orders = await reportService.getOrdersReport(business.id);

        if (active) {
          setResult({ userId, business, orders });
        }
      } catch (error) {
        if (active) {
          setResult({
            userId,
            error: error.message,
          });
        }
      }
    }

    void loadReport();

    return () => {
      active = false;
    };
  }, [userId]);

  if (!userId || result?.userId !== userId) {
    return <p>Cargando reporte...</p>;
  }

  if (result.error) {
    return <p role="alert">{result.error}</p>;
  }

  if (!result.business) {
    return <p>Primero debes configurar tu negocio para consultar reportes.</p>;
  }

  return (
    <div className="container">
      <p className="eyebrow">Panel del emprendedor</p>

      <h1>Reportes</h1>

      <p>Consulta los pedidos registrados de tu emprendimiento.</p>

      <ReportFilters orders={result.orders} />
    </div>
  );
}
