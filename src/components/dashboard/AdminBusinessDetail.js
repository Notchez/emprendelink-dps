"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { adminService } from "@/services/adminService";

import styles from "./AdminBusinessDetail.module.css";

function formatMoney(value) {
  return new Intl.NumberFormat("es-SV", { style: "currency", currency: "USD" }).format(value || 0);
}

export default function AdminBusinessDetail({ businessId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await adminService.getOverview();
      setData(result);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "No se pudo consultar el emprendimiento.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    adminService.getOverview()
      .then((result) => { if (active) setData(result); })
      .catch((caughtError) => {
        if (active) setError(caughtError instanceof Error ? caughtError.message : "No se pudo consultar el emprendimiento.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const business = data?.commissionInsights.businesses.find((item) => item.id === businessId);
  const maxTrend = Math.max(0, ...(business?.trend.map((month) => month.amount) || []));

  return (
    <div className={styles.page}>
      <div className={styles.heading}>
        <div>
          <Link href="/admin/emprendimientos" className={styles.backLink}><i className="bi bi-arrow-left" aria-hidden="true" /> Volver a emprendimientos</Link>
          <p className="eyebrow">Análisis del negocio</p>
          <h1>{business?.name || "Detalle de emprendimiento"}</h1>
          <p>Pedidos entregados, ventas y comisiones registradas en EmprendeLink.</p>
        </div>
        <button type="button" onClick={() => void reload()} disabled={loading} className={styles.refresh}>
          {loading ? "Actualizando..." : "Actualizar"}
        </button>
      </div>

      {error && <p className={styles.error} role="alert">{error}</p>}
      {loading && !data && <p role="status">Cargando desempeño...</p>}
      {data && !business && <p role="status">Este emprendimiento no se encontró o ya no está registrado.</p>}

      {business && (
        <>
          <div className={styles.summary}>
            <div className={styles.mainMetric}>
              <span>Comisiones en {data.commissionInsights.monthLabel} (UTC)</span>
              <strong>{formatMoney(business.monthlyCommissions)}</strong>
              <small>{business.monthlyCommissionCount} pedidos con comisión este mes</small>
            </div>
            <Metric label="Comisiones históricas" value={formatMoney(business.historicalCommissions)} />
            <Metric label="Ventas entregadas" value={formatMoney(business.deliveredSales)} />
            <Metric label="Pedidos registrados" value={business.totalOrders} />
            <Metric label="Pedidos entregados" value={business.deliveredOrders} />
            <Metric label="Productos activos" value={business.activeProductsCount} />
          </div>

          <section className={styles.card} aria-labelledby="trend-title">
            <h2 id="trend-title">Evolución de comisiones</h2>
            <p>Comisiones de pedidos entregados durante los últimos seis meses (UTC), no ventas totales.</p>
            <figure className={styles.trendFigure}>
              <div className={styles.trend} role="list" aria-label="Comisiones por mes en dólares">
                {business.trend.map((month) => (
                  <div key={month.key} className={styles.trendColumn} role="listitem" aria-label={`${month.key}: ${formatMoney(month.amount)}`}>
                    <strong>{formatMoney(month.amount)}</strong>
                    <div className={styles.trendTrack}>
                      {month.amount > 0 && (
                        <span
                          className={styles.trendBar}
                          style={{ height: `${(month.amount / maxTrend) * 100}%` }}
                        />
                      )}
                    </div>
                    <span>{month.label}</span>
                  </div>
                ))}
              </div>
              <figcaption className={styles.trendCaption}>
                <span className={styles.legendSwatch} aria-hidden="true" />
                Cada barra azul representa las comisiones de un mes. Sin barra significa $0.00.
              </figcaption>
            </figure>
            {maxTrend === 0 && (
              <p className={styles.noCommissions}>Este emprendimiento aún no registra comisiones en el período mostrado.</p>
            )}
          </section>

          <section className={styles.card} aria-labelledby="business-data-title">
            <h2 id="business-data-title">Información del emprendimiento</h2>
            <div className={styles.details}>
              <Info label="Propietario" value={business.ownerName} />
              <Info label="Correo del propietario" value={business.ownerEmail || "Sin correo"} />
              <Info label="Plan contratado" value={business.planName} />
              <Info label="Estado de publicación" value={business.active ? "Publicado" : "Oculto"} />
            </div>
            <div className={styles.links}>
              <Link href="/admin/emprendimientos">Administrar plan o publicación</Link>
              {business.slug && <Link href={`/catalogo/${encodeURIComponent(business.slug)}`}>Abrir catálogo público</Link>}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function Metric({ label, value }) {
  return <div className={styles.metric}><span>{label}</span><strong>{value}</strong></div>;
}

function Info({ label, value }) {
  return <div className={styles.info}><span>{label}</span><strong>{value}</strong></div>;
}
