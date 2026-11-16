import Link from "next/link";

import KpiCard from "./KpiCard";
import styles from "./AdminDashboard.module.css";

function formatMoney(value) {
  return new Intl.NumberFormat("es-SV", { style: "currency", currency: "USD" }).format(value || 0);
}

export default function AdminDashboard({ kpis, commissionInsights }) {
  const rows = commissionInsights.businesses;
  const maxValue = Math.max(1, ...rows.map((business) => business.monthlyCommissions));

  return (
    <div className={styles.dashboard}>
      <section className={styles.featured} aria-labelledby="admin-monthly-commissions">
        <div>
          <p className={styles.eyebrow}>Ingresos de la plataforma · {commissionInsights.monthLabel} (UTC)</p>
          <h2 id="admin-monthly-commissions">Comisiones del mes</h2>
          <strong className={styles.amount}>{formatMoney(commissionInsights.totalMonthCommissions)}</strong>
          <p>{commissionInsights.totalMonthOperations} pedidos generaron comisión este mes.</p>
        </div>
        <i className="bi bi-graph-up-arrow" aria-hidden="true" />
      </section>

      <div className={styles.kpiGrid}>
        <KpiCard title="Emprendimientos" value={kpis.totalBusinesses} href="/admin/emprendimientos" />
        <KpiCard title="Negocios publicados" value={kpis.activeBusinesses} href="/admin/emprendimientos" />
        <KpiCard title="Compradores" value={kpis.totalCustomers} href="/admin/compradores" />
        <KpiCard title="Pedidos totales" value={kpis.totalOrders} href="/orders" />
        <KpiCard title="Ventas entregadas" value={formatMoney(kpis.totalSales)} href="/admin/ventas" />
        <KpiCard title="Comisiones históricas" value={formatMoney(kpis.totalCommissions)} href="/admin/comisiones" />
      </div>

      <section className={styles.chartCard} aria-labelledby="commission-chart-title">
        <div className={styles.chartHeading}>
          <div>
            <h2 id="commission-chart-title">Comisiones por emprendimiento</h2>
            <p>Resultados del mes actual. Selecciona un negocio para consultar su desempeño.</p>
          </div>
          <Link className={styles.allLink} href="/admin/emprendimientos">Ver emprendimientos</Link>
        </div>
        {rows.length === 0 ? (
          <p className={styles.empty}>Todavía no se han registrado emprendimientos.</p>
        ) : (
          <ul className={styles.chart} aria-label="Comisiones del mes por emprendimiento">
            {rows.map((business) => (
              <li key={business.id}>
                <Link
                  className={styles.chartRow}
                  href={`/admin/emprendimientos/${encodeURIComponent(business.id)}`}
                  aria-label={`${business.name}: ${formatMoney(business.monthlyCommissions)} en comisiones del mes`}
                >
                  <span className={styles.businessName}>{business.name}</span>
                  <span className={styles.track}><span className={styles.bar} style={{ width: `${(business.monthlyCommissions / maxValue) * 100}%` }} /></span>
                  <strong>{formatMoney(business.monthlyCommissions)}</strong>
                  <i className="bi bi-chevron-right" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        )}
        {rows.length > 0 && commissionInsights.totalMonthOperations === 0 && (
          <p className={styles.empty}>Aún no se han generado comisiones este mes. La gráfica se actualizará cuando se entreguen pedidos.</p>
        )}
      </section>
    </div>
  );
}
