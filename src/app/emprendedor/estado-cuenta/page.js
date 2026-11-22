"use client";

import { useEffect, useState } from "react";

import CommissionsTable from "@/components/dashboard/CommissionsTable";
import { useAuth } from "@/context/AuthContext";
import { businessService } from "@/services/businessService";
import { statementService } from "@/services/statementService";
import { buildMonthlyCommissions, formatMonthLabel, getCommissionMonthOptions, getUtcMonthKey } from "@/utils/adminFinancialReports";
import { formatOrderMoney } from "@/utils/orderUtils";
import styles from "@/components/dashboard/EntrepreneurFinancial.module.css";

const EMPTY_COMMISSIONS = [];

export default function Page() {
  const { user } = useAuth();
  const userId = user?.id;

  const [result, setResult] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(() => getUtcMonthKey(new Date()));

  useEffect(() => {
    if (!userId) return;

    let active = true;

    async function loadStatement() {
      try {
        const business = await businessService.getByOwnerId(userId);

        if (!business) {
          if (active) {
            setResult({
              userId,
              business: null,
              commissions: [],
            });
          }

          return;
        }

        const commissions = await statementService.getCommissions(business.id);

        if (active) {
          setResult({
            userId,
            business,
            commissions,
          });
        }
      } catch (error) {
        if (active) {
          setResult({
            userId,
            error: error.message,
          });
        }
      }
    }

    void loadStatement();

    return () => {
      active = false;
    };
  }, [userId]);

  const commissions = result?.commissions || EMPTY_COMMISSIONS;
  const months = getCommissionMonthOptions(commissions);
  const report = buildMonthlyCommissions(
    commissions,
    result?.business ? [result.business] : [],
    selectedMonth
  );
  const monthlyRecords = report.businesses.find((item) => item.id === result?.business?.id)?.records || [];

  if (!userId || result?.userId !== userId) {
    return <p>Cargando estado de cuenta...</p>;
  }

  if (result.error) {
    return <p role="alert">{result.error}</p>;
  }

  if (!result.business) {
    return <p>Primero debes configurar tu negocio para consultar tu estado de cuenta.</p>;
  }

  return (
    <div className="container">
      <p className="eyebrow">Panel del emprendedor</p>

      <h1>Comisiones</h1>

      <p>Consulta las comisiones generadas al entregar pedidos, con su histórico y detalle por mes.</p>

      <section className={styles.page} aria-label="Resumen de comisiones">
        <div className={styles.metrics}>
          <div className={styles.primaryMetric}>
            <span>Comisiones de {formatMonthLabel(selectedMonth)} (UTC)</span>
            <strong>{formatOrderMoney(report.monthlyTotal)}</strong>
            <small>{report.count} pedidos generaron comisión</small>
          </div>
          <div className={styles.metric}>
            <span>Comisiones históricas</span>
            <strong>{formatOrderMoney(report.lifetimeTotal)}</strong>
            <small>Acumulado de todos los períodos</small>
          </div>
        </div>

        <div className={styles.panel}>
          <div className={styles.panelHeading}>
            <div>
              <h2>Detalle de comisiones</h2>
              <p>Selecciona un período y abre los pedidos para consultar sus detalles.</p>
            </div>
          </div>
          <div className={styles.filterRow}>
            <label>Elegir período (UTC)
              <select value={selectedMonth} onChange={(event) => setSelectedMonth(event.target.value)}>
                {months.map((month) => <option key={month.value} value={month.value}>{month.label}</option>)}
              </select>
            </label>
          </div>
          <CommissionsTable commissions={monthlyRecords} />
        </div>
      </section>
    </div>
  );
}
