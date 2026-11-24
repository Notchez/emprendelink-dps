import KpiCard from "./KpiCard";
import styles from "./EntrepreneurDashboard.module.css";
import SalesChart from "./SalesChart";

function formatCurrency(amount) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(amount);
}

export default function EntrepreneurDashboard({ businessName, kpis, salesByPeriod, }) {
    return (
        <section>
            <h2>Resumen de {businessName}</h2>
            <p>Aquí mostraremos los indicadores de ventas y pedidos.</p>

            <div className={styles.kpiGrid}>
                <KpiCard title="Total de pedidos" value={kpis.totalOrders} />
                <KpiCard
                    title="Ventas totales"
                    value={formatCurrency(kpis.totalSales)}
                />
                <KpiCard title="Pedidos pendientes" value={kpis.pendingOrders} />
                <KpiCard title="Pedidos entregados" value={kpis.deliveredOrders} />
                <KpiCard
                    title="Comisiones"
                    value={formatCurrency(kpis.totalCommissions)}
                />
            </div>
            <SalesChart salesByPeriod={salesByPeriod} />
        </section>
    );
}