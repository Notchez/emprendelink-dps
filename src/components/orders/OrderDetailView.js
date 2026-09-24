"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { ORDER_STATUS, ORDER_STATUS_TRANSITIONS } from "@/lib/constants/orderStatus";
import { ROLES } from "@/lib/constants/roles";
import { useAuth } from "@/hooks/useAuth";
import { useOrderDetail } from "@/hooks/useOrderDetail";
import { businessService } from "@/services/businessService";
import { apiRequest } from "@/services/apiClient";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { formatOrderDate, formatOrderMoney, getOrderStatusLabel } from "@/utils/orderUtils";

import styles from "./Orders.module.css";

function formatOrderId(id) {
  return `PED-${String(id).slice(0, 8).toUpperCase()}`;
}

function formatPercentage(rate) {
  return `${new Intl.NumberFormat("es-SV", {
    maximumFractionDigits: 2,
  }).format(Number(rate) * 100)}%`;
}

function getHistoryActor(item, order, user) {
  if (item.changedBy === order.customerId) {
    return "Cliente";
  }

  if (item.changedBy === user?.id) {
    return "Tú";
  }

  return "Personal de gestión";
}

export function OrderDetailView({ orderId, readOnly = false }) {
  const { user } = useAuth();

  const { order, history, loading, updating, error, changeStatus } = useOrderDetail(orderId);

  const businessId = order?.businessId;
  const currentOrderId = order?.id;

  const canViewFinancials =
    !readOnly && (user?.role === ROLES.ADMIN || user?.role === ROLES.ENTREPRENEUR);

  const [businessResult, setBusinessResult] = useState(null);
  const [financialResult, setFinancialResult] = useState(null);

  useEffect(() => {
    if (!businessId) {
      return;
    }

    let active = true;

    businessService
      .getById(businessId)
      .then((business) => {
        if (active) {
          setBusinessResult({
            businessId,
            name: business?.name || "Negocio no disponible",
          });
        }
      })
      .catch(() => {
        if (active) {
          setBusinessResult({
            businessId,
            name: "Negocio no disponible",
          });
        }
      });

    return () => {
      active = false;
    };
  }, [businessId]);

  useEffect(() => {
    if (!currentOrderId || !canViewFinancials) {
      return;
    }

    let active = true;

    apiRequest(`/api/orders/${encodeURIComponent(currentOrderId)}/financials`)
      .then((data) => {
        if (active) {
          setFinancialResult({
            orderId: currentOrderId,
            data,
            error: "",
          });
        }
      })
      .catch((caughtError) => {
        if (active) {
          setFinancialResult({
            orderId: currentOrderId,
            data: null,
            error: caughtError.message,
          });
        }
      });

    return () => {
      active = false;
    };
  }, [currentOrderId, canViewFinancials]);

  if (loading) {
    return <div className={styles.page}>Cargando pedido...</div>;
  }

  if (!order) {
    return (
      <div className={styles.page}>
        <p className={styles.error}>{error || "No se encontró el pedido."}</p>

        <Link href={readOnly ? "/cliente" : "/orders"}>Volver a pedidos</Link>
      </div>
    );
  }

  const nextStatuses = ORDER_STATUS_TRANSITIONS[order.status] || [];

  const financials = financialResult?.orderId === order.id ? financialResult : null;

  const businessName =
    financials?.data?.business?.name ||
    (businessResult?.businessId === order.businessId ? businessResult.name : "Cargando negocio...");

  const currentPlan = financials?.data?.currentPlan;
  const commission = financials?.data?.commission;

  return (
    <div className={styles.page}>
      <Link className={styles.backLink} href={readOnly ? "/cliente" : "/orders"}>
        ← Volver a pedidos
      </Link>

      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Detalle del pedido</p>

          <h1 title={order.id}>{formatOrderId(order.id)}</h1>

          <p>{formatOrderDate(order.createdAt)}</p>
        </div>

        <OrderStatusBadge status={order.status} />
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <section className={styles.detailGrid}>
        <article className={styles.panel}>
          <h2>Información</h2>

          <p>
            <strong>Cliente:</strong> {order.customer?.name || "Cliente"}
          </p>

          <p>
            <strong>Teléfono:</strong> {order.customer?.phone || "—"}
          </p>

          <p>
            <strong>Dirección:</strong> {order.deliveryAddress}
          </p>

          {order.notes && (
            <p>
              <strong>Indicaciones:</strong> {order.notes}
            </p>
          )}

          <p>
            <strong>Negocio:</strong> {businessName}
          </p>

          <p>
            <strong>Total:</strong> {formatOrderMoney(order.subtotal)}
          </p>
        </article>

        {!readOnly && (
          <article className={styles.panel}>
            <h2>Cambiar estado</h2>

            {nextStatuses.length === 0 ? (
              <p className={styles.muted}>Este pedido ya no permite más cambios de estado.</p>
            ) : (
              <div className={styles.statusActions}>
                {nextStatuses.map((status) => (
                  <button
                    key={status}
                    type="button"
                    disabled={updating}
                    onClick={() => changeStatus(status, user?.id)}
                  >
                    {updating ? "Actualizando..." : getOrderStatusLabel(status)}
                  </button>
                ))}
              </div>
            )}
          </article>
        )}
      </section>

      {canViewFinancials && (
        <section className={styles.panel}>
          <h2>Datos del emprendimiento</h2>

          {!financials && <p className={styles.muted}>Cargando información financiera...</p>}

          {financials?.error && <p className={styles.error}>{financials.error}</p>}

          {financials?.data && (
            <>
              <p>
                <strong>Emprendimiento:</strong> {financials.data.business.name}
              </p>

              <p>
                <strong>Plan actual:</strong> {currentPlan?.name || "No disponible"}
              </p>

              <p>
                <strong>Tasa del plan actual:</strong>{" "}
                {currentPlan ? formatPercentage(currentPlan.commissionRate) : "No disponible"}
              </p>

              <p>
                <strong>Comisión de este pedido:</strong>{" "}
                {commission
                  ? formatOrderMoney(commission.amount)
                  : order.status === ORDER_STATUS.DELIVERED
                    ? "No se encontró una comisión registrada."
                    : "Pendiente: se registra al entregar el pedido."}
              </p>

              {commission && (
                <p>
                  <strong>Tasa aplicada a este pedido:</strong> {formatPercentage(commission.rate)}
                </p>
              )}
            </>
          )}
        </section>
      )}

      <section className={styles.panel}>
        <h2>Productos</h2>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio</th>
                <th>Total</th>
              </tr>
            </thead>

            <tbody>
              {order.items.map((item) => (
                <tr key={`${item.productId}-${item.productName}`}>
                  <td>{item.productName}</td>

                  <td>{item.quantity}</td>

                  <td>{formatOrderMoney(item.unitPrice)}</td>

                  <td>{formatOrderMoney(item.lineTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className={styles.panel}>
        <h2>Historial</h2>

        {history.length === 0 ? (
          <p className={styles.muted}>Todavía no hay cambios registrados.</p>
        ) : (
          <div className={styles.historyList}>
            {history.map((item, index) => (
              <div className={styles.historyItem} key={`${item.changedAt}-${index}`}>
                <div>
                  <strong>{getOrderStatusLabel(item.newStatus)}</strong>

                  <p className={styles.muted}>
                    {item.oldStatus
                      ? `${getOrderStatusLabel(item.oldStatus)} → ${getOrderStatusLabel(item.newStatus)}`
                      : "Pedido creado"}
                  </p>
                </div>

                <div className={styles.historyMeta}>
                  <span>{getHistoryActor(item, order, user)}</span>

                  <span>{formatOrderDate(item.changedAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
