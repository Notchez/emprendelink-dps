"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { businessService } from "@/services/businessService";
import { orderService } from "@/services/orderService";
import { buildDeliveredSales } from "@/utils/adminFinancialReports";
import { formatOrderDate, formatOrderMoney } from "@/utils/orderUtils";

import styles from "@/components/dashboard/AdminFinancialDashboard.module.css";

function formatOrderId(id) {
  return `PED-${String(id).slice(0, 8).toUpperCase()}`;
}

export default function AdminSalesPage() {
  const [result, setResult] = useState(null);
  const [expandedBusiness, setExpandedBusiness] = useState("");
  const [visibleCount, setVisibleCount] = useState(12);

  useEffect(() => {
    let active = true;
    Promise.all([orderService.getOrders(), businessService.getAll()])
      .then(([orders, businesses]) => {
        if (active) setResult({ orders, businesses, error: "" });
      })
      .catch((error) => {
        if (active) setResult({ orders: [], businesses: [], error: error.message });
      });

    return () => { active = false; };
  }, []);

  const report = useMemo(
    () => buildDeliveredSales(result?.orders || [], result?.businesses || []),
    [result]
  );

  return (
    <div className={styles.page}>
      <header className={styles.heading}>
        <p className="eyebrow">Panel del administrador</p>
        <h1>Ventas entregadas</h1>
        <p>Ventas efectivas de todos los emprendimientos. Los pedidos cancelados no se contabilizan.</p>
      </header>

      {!result && <p role="status" className={styles.message}>Cargando ventas...</p>}
      {result?.error && <p role="alert" className={styles.error}>{result.error}</p>}

      {result && !result.error && (
        <>
          <section className={styles.metrics} aria-label="Resumen de ventas">
            <div className={styles.primaryMetric}>
              <span>Ventas totales entregadas</span>
              <strong>{formatOrderMoney(report.total)}</strong>
              <small>Acumulado histórico</small>
            </div>
            <div className={styles.metric}><span>Pedidos entregados</span><strong>{report.count}</strong></div>
            <div className={styles.metric}><span>Emprendimientos registrados</span><strong>{result.businesses.length}</strong></div>
          </section>

          <section className={styles.panel} aria-labelledby="business-sales-title">
            <div className={styles.panelHeading}>
              <h2 id="business-sales-title">Ventas por emprendimiento</h2>
              <p>Abre cada negocio para consultar sus pedidos entregados y sus detalles.</p>
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
                            <Link className={styles.detailLink} href={`/admin/emprendimientos/${encodeURIComponent(business.id)}`}>
                              Ver desempeño del negocio <i className="bi bi-arrow-right" aria-hidden="true" />
                            </Link>
                          )}
                          {business.records.length === 0 ? (
                            <p>Este negocio aún no tiene ventas entregadas.</p>
                          ) : (
                            <>
                              <div className={styles.tableWrap}>
                                <table className={styles.table}>
                                  <thead><tr><th>Pedido</th><th>Fecha del pedido</th><th>Comprador</th><th>Venta</th><th>Detalle</th></tr></thead>
                                  <tbody>
                                    {visibleOrders.map((order) => (
                                      <tr key={order.id}>
                                        <td title={order.id}>{formatOrderId(order.id)}</td>
                                        <td>{formatOrderDate(order.createdAt)}</td>
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
