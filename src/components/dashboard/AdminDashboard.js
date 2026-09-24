import KpiCard from "./KpiCard";
import styles from "./EntrepreneurDashboard.module.css";

export default function AdminDashboard({ kpis }) {
  return (
    <section>
      <h2>Resumen general de la plataforma</h2>

      <p>Indicadores actualizados de EmprendeLink.</p>

      <div className={styles.kpiGrid}>
        <KpiCard
          title="Emprendimientos registrados"
          value={kpis.totalBusinesses}
          href="/admin#businesses-title"
        />

        <KpiCard
          title="Emprendimientos activos"
          value={kpis.activeBusinesses}
          href="/admin#businesses-title"
        />

        <KpiCard title="Usuarios registrados" value={kpis.totalUsers ?? 0} href="/admin/usuarios" />

        <KpiCard title="Planes activos" value={kpis.activePlans ?? 0} href="/admin/planes" />

        <KpiCard title="Total de pedidos" value={kpis.totalOrders} href="/orders" />

        <KpiCard
          title="Ventas entregadas"
          value={`$${kpis.totalSales.toFixed(2)}`}
          href="/admin/ventas"
        />

        <KpiCard
          title="Comisiones registradas"
          value={`$${kpis.totalCommissions.toFixed(2)}`}
          href="/admin/comisiones"
        />
      </div>
    </section>
  );
}
