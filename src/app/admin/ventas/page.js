"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { apiRequest } from "@/services/apiClient";
import { businessService } from "@/services/businessService";
import { orderService } from "@/services/orderService";
import {
  buildDeliveredDates,
  buildDeliveredSales,
  formatMonthLabel,
  getSalesMonthOptions,
  getUtcMonthKey,
} from "@/utils/adminFinancialReports";
import { formatOrderDate, formatOrderMoney } from "@/utils/orderUtils";

import styles from "@/components/dashboard/AdminFinancialDashboard.module.css";

function formatOrderId(id) {
  return `PED-${String(id).slice(0, 8).toUpperCase()}`;
}

export default function AdminSalesPage() {
  const [result, setResult] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(() => getUtcMonthKey(new Date()));
  const [expandedBusiness, setExpandedBusiness] = useState("");
  const [visibleCount, setVisibleCount] = useState(12);

  useEffect(() => {
    let active = true;
    Promise.all([orderService.getOrders(), businessService.getAll(), apiRequest("/api/commissions")])
      .then(([orders, businesses, commissions]) => {
        if (active) setResult({ orders, businesses, commissions, error: "" });
      })
      .catch((error) => {
        if (active) setResult({ orders: [], businesses: [], commissions: [], error: error.message });
      });

    return () => { active = false; };
  }, []);

  const deliveredDates = useMemo(
    () => buildDeliveredDates(result?.commissions || []),
    [result]
  );
  const lifetimeReport = useMemo(
    () => buildDeliveredSales(result?.orders || [], result?.businesses || []),
    [result]
  );
  const report = useMemo(
    () => buildDeliveredSales(result?.orders || [], result?.businesses || [], {
      month: selectedMonth,
      deliveredDates,
    }),
    [result, selectedMonth, deliveredDates]
  );
  const months = useMemo(
    () => getSalesMonthOptions(result?.orders || [], deliveredDates),
    [result, deliveredDates]
  );

  return (
    <div className={styles.page}>
      <header className={styles.heading}>
        <p className="eyebrow">Panel del administrador</p>
        <h1>Ventas entregadas</h1>
        <p>Consulta las ventas entregadas por mes y el acumulado histórico. Los pedidos cancelados no se contabilizan.</p>
      </header>

      {!result && <p role="status" className={styles.message}>Cargando ventas...</p>}
      {result?.error && <p role="alert" className={styles.error}>{result.error}</p>}

      {result && !result.error && (
        <>
          <section className={styles.metrics} aria-label="Resumen de ventas">
            <div className={styles.primaryMetric}>
              <span>Ventas totales entregadas</span>
              <strong>{formatOrderMoney(lifetimeReport.total)}</strong>
              <small>Acumulado histórico · {lifetimeReport.count} pedidos entregados</small>
            </div>
            <div className={styles.metric}>
              <span>Ventas de {formatMonthLabel(selectedMonth)} (UTC)</span>
              <strong>{formatOrderMoney(report.total)}</strong>
              <small>{report.count} pedidos entregados en el período</small>
            </div>
            <div className={styles.metric}><span>Emprendimientos registrados</span><strong>{result.businesses.length}</strong></div>
          </section>

          <section className={styles.panel} aria-labelledby="sales-period-title">
            <div className={styles.panelHeading}>
              <h2 id="sales-period-title">Elegir período</h2>
              <p>El filtro muestra las ventas entregadas en ese mes. El acumulado histórico no cambia.</p>
            </div>
            <label className={styles.monthSelect}>
              Mes de venta
              <select
                value={selectedMonth}
                onChange={(event) => {
                  setSelectedMonth(event.target.value);
                  setExpandedBusiness("");
                  setVisibleCount(12);
                }}
              >
                {months.map((month) => (
                  <option key={month.value} value={month.value}>{month.label}</option>
                ))}
              </select>
            </label>
          </section>

          <section className={styles.panel} aria-labelledby="business-sales-title">
            <div className={styles.panelHeading}>
              <h2 id="business-sales-title">Ventas por emprendimiento · {formatMonthLabel(selectedMonth)}</h2>
              <p>Abre cada negocio para consultar los pedidos entregados en el período seleccionado.</p>
            </div>
            {report.businesses.length === 0 ? (
              <p className={styles.message}>Todavía no hay emprendimientos registrados.</p>
            ) : (
              <div className={styles.businessList}>
                {report.businesses.map((business) => {
                  const expanded = expandedBusiness === business.id;
                  const visibleOrders = business.records.slice(0, visibleCount);

                  return (
                    <article className={styles.businessRow} key={business.id}>
                      <div className={styles.businessTop}>
                        <div>
                          <h3>{business.name}</h3>
                          <p>{business.count} pedidos entregados{business.active ? "" : " · Negocio inactivo o eliminado"}</p>
                        </div>
                        <strong className={styles.businessAmount}>{formatOrderMoney(business.amount)}</strong>
                        <button
                          type="button"
                          className={styles.expandButton}
                          onClick={() => { setExpandedBusiness(expanded ? "" : business.id); setVisibleCount(12); }}
                          aria-expanded={expanded}
                        >
                          {expanded ? "Ocultar pedidos" : "Ver pedidos"}
                          <i className={`bi bi-chevron-${expanded ? "up" : "down"}`} aria-hidden="true" />
                        </button>
                      </div>

                      {expanded && (
                        <div className={styles.expanded}>
                          {business.id !== "sin-negocio" && business.name !== "Negocio no disponible" && (
                            <Link className={styles.detailLink} href={`/admin/emprendimientos/${encodeURIComponent(business.id)}?month=${selectedMonth}`}>
                              Ver desempeño del negocio <i className="bi bi-arrow-right" aria-hidden="true" />
                            </Link>
                          )}
                          {business.records.length === 0 ? (
                            <p>Este negocio no tiene ventas entregadas en el mes seleccionado.</p>
                          ) : (
                            <>
                              <div className={styles.tableWrap}>
                                <table className={styles.table}>
                                  <thead><tr><th>Pedido</th><th>Fecha del pedido</th><th>Fecha de entrega</th><th>Comprador</th><th>Venta</th><th>Detalle</th></tr></thead>
                                  <tbody>
                                    {visibleOrders.map((order) => (
                                      <tr key={order.id}>
                                        <td title={order.id}>{formatOrderId(order.id)}</td>
                                        <td>{formatOrderDate(order.createdAt)}</td>
                                        <td>{formatOrderDate(order.deliveredAt || deliveredDates[order.id])}</td>
                                        <td>{order.customer?.name || "Cliente"}</td>
                                        <td>{formatOrderMoney(order.subtotal)}</td>
                                        <td><Link href={`/orders/${encodeURIComponent(order.id)}`}>Ver detalle</Link></td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                              {business.records.length > visibleOrders.length && (
                                <button type="button" className={styles.expandButton} onClick={() => setVisibleCount((count) => count + 12)}>
                                  Mostrar más pedidos ({business.records.length - visibleOrders.length} restantes)
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
