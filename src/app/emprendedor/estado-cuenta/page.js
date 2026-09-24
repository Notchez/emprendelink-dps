"use client";

import { useEffect, useState } from "react";

import CommissionsTable from "@/components/dashboard/CommissionsTable";
import { useAuth } from "@/context/AuthContext";
import { businessService } from "@/services/businessService";
import { statementService } from "@/services/statementService";

export default function Page() {
  const { user } = useAuth();
  const userId = user?.id;

  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!userId) return;

    let active = true;

    async function loadStatement() {
      try {
        const business = await businessService.getByOwnerId(userId);

        if (!business) {
          if (active) {
            setResult({
              userId,
              business: null,
              commissions: [],
            });
          }

          return;
        }

        const commissions = await statementService.getCommissions(business.id);

        if (active) {
          setResult({
            userId,
            business,
            commissions,
          });
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

    void loadStatement();

    return () => {
      active = false;
    };
  }, [userId]);

  if (!userId || result?.userId !== userId) {
    return <p>Cargando estado de cuenta...</p>;
  }

  if (result.error) {
    return <p role="alert">{result.error}</p>;
  }

  if (!result.business) {
    return <p>Primero debes configurar tu negocio para consultar tu estado de cuenta.</p>;
  }

  return (
    <div className="container">
      <p className="eyebrow">Panel del emprendedor</p>

      <h1>Estado de cuenta</h1>

      <p>Consulta las comisiones registradas de tu emprendimiento.</p>

      <section>
        <h2>Comisiones registradas</h2>

        <p>Registros encontrados: {result.commissions.length}</p>

        <CommissionsTable commissions={result.commissions} />
      </section>
    </div>
  );
}
