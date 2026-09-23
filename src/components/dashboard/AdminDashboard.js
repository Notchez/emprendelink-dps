import KpiCard from "./KpiCard";
import styles from "./EntrepreneurDashboard.module.css";

export default function AdminDashboard({ kpis }) {
  return (
    <section>
      <h2>Resumen general de la plataforma</h2>
      <p>Indicadores actualizados de EmprendeLink.</p>

      <div className={styles.kpiGrid}>
        <KpiCard title="Emprendimientos registrados" value={kpis.totalBusinesses} />
        <KpiCard title="Emprendimientos activos" value={kpis.activeBusinesses} />
        <KpiCard title="Usuarios registrados" value={kpis.totalUsers ?? 0} />
        <KpiCard title="Planes activos" value={kpis.activePlans ?? 0} />
        <KpiCard title="Total de pedidos" value={kpis.totalOrders} />
        <KpiCard title="Ventas totales" value={`$${kpis.totalSales.toLocaleString("en-US")}`} />
        <KpiCard title="Comisiones" value={`$${kpis.totalCommissions.toLocaleString("en-US")}`} />
      </div>
    </section>
  );
}
