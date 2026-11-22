"use client";

import { useMemo, useState } from "react";

import OrdersReport from "./OrdersReport";
import { filterEntrepreneurSales, totalEntrepreneurSales } from "@/utils/entrepreneurReports";
import { formatOrderMoney } from "@/utils/orderUtils";
import { printSalesReport } from "@/utils/salesPrint";
import styles from "./EntrepreneurFinancial.module.css";

export default function ReportFilters({ orders, businessName }) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [printError, setPrintError] = useState("");

  const invalidRange = Boolean(startDate && endDate && startDate > endDate);
  const filteredOrders = useMemo(
    () => invalidRange ? [] : filterEntrepreneurSales(orders, startDate, endDate),
    [orders, startDate, endDate, invalidRange]
  );

  function handlePrint() {
    try {
      printSalesReport({ businessName, orders: filteredOrders, startDate, endDate });
      setPrintError("");
    } catch (error) {
      setPrintError(error instanceof Error ? error.message : "No se pudo preparar el reporte.");
    }
  }

  return (
    <section className={styles.page}>
      <div className={styles.metrics}>
        <div className={styles.primaryMetric}>
          <span>Ventas totales entregadas</span>
          <strong>{formatOrderMoney(totalEntrepreneurSales(orders))}</strong>
          <small>{orders.length} pedidos entregados históricamente</small>
        </div>
        <div className={styles.metric}>
          <span>Ventas del período</span>
          <strong>{formatOrderMoney(totalEntrepreneurSales(filteredOrders))}</strong>
          <small>{filteredOrders.length} pedidos</small>
        </div>
      </div>

      <section className={styles.panel} aria-labelledby="entrepreneur-sales-period-title">
        <div className={styles.panelHeading}>
          <div>
            <h2 id="entrepreneur-sales-period-title">Elegir período</h2>
            <p>Las fechas corresponden a la entrega, en horario de El Salvador.</p>
          </div>
        </div>
        <div className={styles.filterRow}>
          <label>Desde
            <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
          </label>
          <label>Hasta
            <input type="date" min={startDate || undefined} value={endDate} onChange={(event) => setEndDate(event.target.value)} />
          </label>
          <button type="button" className={styles.secondaryButton} onClick={() => { setStartDate(""); setEndDate(""); }}>Limpiar fechas</button>
          <button type="button" className={styles.primaryButton} onClick={handlePrint} disabled={invalidRange || filteredOrders.length === 0}>
            <i className="bi bi-file-earmark-pdf" aria-hidden="true" /> Generar PDF
          </button>
        </div>
        {invalidRange && <p className={styles.error} role="alert">La fecha inicial no puede ser posterior a la final.</p>}
        {printError && <p className={styles.error} role="alert">{printError}</p>}
        <p className={styles.note}>Al generar el reporte, selecciona «Guardar como PDF» en la ventana de impresión.</p>
      </section>

      <OrdersReport orders={filteredOrders} />
    </section>
  );
}
