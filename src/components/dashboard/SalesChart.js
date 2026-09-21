import styles from "./SalesChart.module.css";

export default function SalesChart({ salesByPeriod }) {
    const maxSales = Math.max(...salesByPeriod.map((day) => day.sales), 1);

    return (
        <section className={styles.chart}>
            <h3>Ventas de la semana</h3>

            <div className={styles.bars}>
                {salesByPeriod.map((day) => (
                    <div key={day.label} className={styles.barWrapper}>
                        <span className={styles.barValue}>${day.sales}</span>

                        <div
                            className={styles.bar}
                            style={{ height: `${(day.sales / maxSales) * 100}%` }}
                            title={`${day.label}: $${day.sales}`}
                        />
                    </div>
                ))}
            </div>
            <div className={styles.dayLabels}>
                {salesByPeriod.map((day) => (
                    <span key={day.label} className={styles.dayLabel}>
                        {day.label}
                    </span>
                ))}
            </div>
        </section>
    );
}