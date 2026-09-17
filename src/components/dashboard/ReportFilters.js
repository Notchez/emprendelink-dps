"use client";

import { useState } from "react";
import OrdersReport from "./OrdersReport";
import styles from "./ReportFilters.module.css";

export default function ReportFilters({ orders }) {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const filteredOrders = orders.filter((order) => {
        const afterStartDate = !startDate || order.date >= startDate;
        const beforeEndDate = !endDate || order.date <= endDate;

        return afterStartDate && beforeEndDate;
    });

    return (
        <section className={styles.filters}>
            <h2>Filtrar reporte</h2>

            <div className={styles.fields}>
                <div className={styles.field}>
                    <label htmlFor="startDate">Desde</label>
                    <input
                        id="startDate"
                        name="startDate"
                        type="date"
                        value={startDate}
                        onChange={(event) => setStartDate(event.target.value)}
                    />
                </div>

                <div className={styles.field}>
                    <label htmlFor="endDate">Hasta</label>
                    <input
                        id="endDate"
                        name="endDate"
                        type="date"
                        value={endDate}
                        onChange={(event) => setEndDate(event.target.value)}
                    />
                </div>
            </div>
            <p>Pedidos encontrados: {filteredOrders.length}</p>

            <OrdersReport orders={filteredOrders} />
        </section>
    );
}