"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { apiRequest } from "@/services/apiClient";
import { businessService } from "@/services/businessService";
import {
  buildMonthlyCommissions,
  getCommissionMonthOptions,
  getUtcMonthKey,
  formatMonthLabel,
} from "@/utils/adminFinancialReports";
import { formatOrderDate, formatOrderMoney } from "@/utils/orderUtils";

import styles from "@/components/dashboard/AdminFinancialDashboard.module.css";

function formatOrderId(id) {
  return `PED-${String(id).slice(0, 8).toUpperCase()}`;
}

function formatPercentage(rate) {
  return `${new Intl.NumberFormat("es-SV", { maximumFractionDigits: 2 }).format(Number(rate || 0) * 100)}%`;
}

export default function AdminCommissionsPage() {
  const [result, setResult] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(() => getUtcMonthKey(new Date()));
  const [expandedBusiness, setExpandedBusiness] = useState("");
  const [visibleCount, setVisibleCount] = useState(12);

  useEffect(() => {
    let active = true;
    Promise.all([apiRequest("/api/commissions"), businessService.getAll()])
      .then(([commissions, businesses]) => {
        if (active) setResult({ commissions, businesses, error: "" });
      })
      .catch((error) => {
        if (active) setResult({ commissions: [], businesses: [], error: error.message });
      });
    return () => { active = false; };
  }, []);

  const businesses = result?.businesses || [];
  const report = useMemo(
    () => buildMonthlyCommissions(result?.commissions || [], result?.businesses || [], selectedMonth),
    [result, selectedMonth]
  );
  const months = useMemo(() => getCommissionMonthOptions(result?.commissions || []), [result]);

  return (
    <div className={styles.page}>
      <header className={styles.heading}>
        <p className="eyebrow">Panel del administrador</p>
        <h1>Comisiones de EmprendeLink</h1>
        <p>Consulta lo generado en cada mes y el acumulado histórico sin confundir comisiones con ventas.</p>
      </header>

      {!result && <p role="status" className={styles.message}>Cargando comisiones...</p>}
      {result?.error && <p role="alert" className={styles.error}>{result.error}</p>}

      {result && !result.error && (
        <>
          <section className={styles.metrics} aria-label="Resumen de comisiones">
            <div className={styles.primaryMetric}>
              <span>Comisiones del {formatMonthLabel(selectedMonth)} (UTC)</span>
              <strong>{formatOrderMoney(report.monthlyTotal)}</strong>
              <small>{report.count} pedidos generaron comisión en este período</small>
            </div>
            <div className={styles.metric}>
              <span>Comisiones totales (lifetime)</span>
              <strong>{formatOrderMoney(report.lifetimeTotal)}</strong>
              <small>Todos los meses registrados</small>
            </div>
            <div className={styles.metric}>
              <span>Emprendimientos registrados</span>
              <strong>{businesses.length}</strong>
            </div>
          </section>

          <section className={styles.panel} aria-labelledby="commission-period-title">
            <div className={styles.panelHeading}>
              <h2 id="commission-period-title">Elegir período</h2>
              <p>El filtro se aplica al listado por negocio. El acumulado histórico no cambia.</p>
            </div>
            <label className={styles.monthSelect}>
              Mes de comisión
              <select
                value={selectedMonth}
                onChange={(event) => { setSelectedMonth(event.target.value); setExpandedBusiness(""); setVisibleCount(12); }}
              >
                {months.map((month) => <option key={month.value} value={month.value}>{month.label}</option>)}
              </select>
            </label>
          </section>

          <section className={styles.panel} aria-labelledby="commission-by-business-title">
            <div className={styles.panelHeading}>
              <h2 id="commission-by-business-title">Comisiones por negocio · {formatMonthLabel(selectedMonth)}</h2>
              <p>Selecciona un emprendimiento para ver los pedidos que generaron sus comisiones.</p>
            </div>
            {report.businesses.length === 0 ? (
              <p className={styles.message}>No hay negocios ni comisiones registradas.</p>
            ) : (
              <div className={styles.businessList}>
                {report.businesses.map((business) => {
                  const expanded = expandedBusiness === business.id;
                  const visibleCommissions = business.records.slice(0, visibleCount);

                  return (
                    <article className={styles.businessRow} key={business.id}>
                      <div className={styles.businessTop}>
                        <div>
                          <h3>{business.name}</h3>
                          <p>{business.count} pedidos con comisión{business.active ? "" : " · Negocio inactivo o eliminado"}</p>
                        </div>
                        <strong className={styles.businessAmount}>{formatOrderMoney(business.amount)}</strong>
                        <button
                          type="button"
                          className={styles.expandButton}
                          onClick={() => { setExpandedBusiness(expanded ? "" : business.id); setVisibleCount(12); }}
                          aria-expanded={expanded}
                        >
                          {expanded ? "Ocultar detalle" : "Ver comisiones"}
                          <i className={`bi bi-chevron-${expanded ? "up" : "down"}`} aria-hidden="true" />
                        </button>
                      </div>

                      {expanded && (
                        <div className={styles.expanded}>
                          {business.id !== "sin-negocio" && business.name !== "Negocio no disponible" && (
                            <Link className={styles.detailLink} href={`/admin/emprendimientos/${encodeURIComponent(business.id)}?month=${selectedMonth}`}>
                              Detalle mensual del emprendimiento <i className="bi bi-arrow-right" aria-hidden="true" />
                            </Link>
                          )}
                          {business.records.length === 0 ? (
                            <p>No se generaron comisiones para este negocio en el mes seleccionado.</p>
                          ) : (
                            <>
                              <div className={styles.tableWrap}>
                                <table className={styles.table}>
                                  <thead><tr><th>Pedido</th><th>Fecha de entrega</th><th>Tasa aplicada</th><th>Comisión</th><th>Detalle</th></tr></thead>
                                  <tbody>
                                    {visibleCommissions.map((commission) => (
                                      <tr key={commission.id}>
                                        <td title={commission.orderId}>{formatOrderId(commission.orderId)}</td>
                                        <td>{formatOrderDate(commission.createdAt)}</td>
                                        <td>{formatPercentage(commission.rate)}</td>
                                        <td>{formatOrderMoney(commission.amount)}</td>
                                        <td><Link href={`/orders/${encodeURIComponent(commission.orderId)}`}>Ver pedido</Link></td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                              {business.records.length > visibleCommissions.length && (
                                <button type="button" className={styles.expandButton} onClick={() => setVisibleCount((count) => count + 12)}>
                                  Mostrar más comisiones ({business.records.length - visibleCommissions.length} restantes)
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
