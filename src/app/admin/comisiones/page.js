"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { apiRequest } from "@/services/apiClient";
import { businessService } from "@/services/businessService";

function formatMoney(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(amount || 0));
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("es-SV", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/El_Salvador",
  }).format(date);
}

function formatPercentage(rate) {
  return `${new Intl.NumberFormat("es-SV", {
    maximumFractionDigits: 2,
  }).format(Number(rate || 0) * 100)}%`;
}

function formatOrderId(id) {
  return `PED-${String(id).slice(0, 8).toUpperCase()}`;
}

export default function AdminCommissionsPage() {
  const [result, setResult] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadCommissions() {
      try {
        const commissions = await apiRequest("/api/commissions");

        const businessIds = [
          ...new Set(commissions.map((commission) => commission.businessId).filter(Boolean)),
        ];

        const businessEntries = await Promise.all(
          businessIds.map(async (businessId) => {
            try {
              const business = await businessService.getById(businessId);

              return [businessId, business?.name || "Negocio no disponible"];
            } catch {
              return [businessId, "Negocio no disponible"];
            }
          })
        );

        if (active) {
          setResult({
            commissions,
            businessNames: Object.fromEntries(businessEntries),
            error: "",
          });
        }
      } catch (error) {
        if (active) {
          setResult({
            commissions: [],
            businessNames: {},
            error:
              error instanceof Error ? error.message : "No se pudieron consultar las comisiones.",
          });
        }
      }
    }

    void loadCommissions();

    return () => {
      active = false;
    };
  }, []);

  const commissions = result?.commissions || [];

  const total = commissions.reduce((sum, commission) => sum + Number(commission.amount || 0), 0);

  return (
    <div className="container">
      <p className="eyebrow">Panel del administrador</p>

      <h1>Comisiones registradas</h1>

      {!result && <p>Cargando comisiones...</p>}

      {result?.error && <p role="alert">{result.error}</p>}

      {result && !result.error && (
        <>
          <p>Comisiones encontradas: {commissions.length}</p>

          <h2>Total: {formatMoney(total)}</h2>

          {commissions.length === 0 ? (
            <p>Todavía no hay comisiones registradas.</p>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Emprendimiento</th>
                    <th>Pedido</th>
                    <th>Fecha de entrega</th>
                    <th>Tasa aplicada</th>
                    <th>Monto de comisión</th>
                  </tr>
                </thead>

                <tbody>
                  {commissions.map((commission) => (
                    <tr key={commission.id}>
                      <td>
                        {result.businessNames[commission.businessId] || "Negocio no disponible"}
                      </td>

                      <td>
                        <Link
                          href={`/orders/${encodeURIComponent(commission.orderId)}`}
                          title={commission.orderId}
                        >
                          {formatOrderId(commission.orderId)}
                        </Link>
                      </td>

                      <td>{formatDate(commission.createdAt)}</td>

                      <td>{formatPercentage(commission.rate)}</td>

                      <td>
                        <strong>{formatMoney(commission.amount)}</strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
