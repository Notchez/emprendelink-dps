"use client";

import Link from "next/link";
import { ORDER_STATUS_TRANSITIONS } from "@/lib/constants/orderStatus";
import { useAuth } from "@/hooks/useAuth";
import { useOrderDetail } from "@/hooks/useOrderDetail";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { formatOrderDate, formatOrderMoney, getOrderStatusLabel } from "@/utils/orderUtils";
import styles from "./Orders.module.css";

export function OrderDetailView({ orderId, readOnly = false }) {
  const { user } = useAuth();
  const { order, history, loading, updating, error, changeStatus } = useOrderDetail(orderId);

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
  const changedBy = user?.id;

  return (
    <div className={styles.page}>
      <Link className={styles.backLink} href={readOnly ? "/cliente" : "/orders"}>
        ← Volver a pedidos
      </Link>

      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Detalle del pedido</p>
          <h1>{order.id}</h1>
          <p>{formatOrderDate(order.createdAt)}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <section className={styles.detailGrid}>
        <article className={styles.panel}>
          <h2>Información</h2>
          <p>
            <strong>Cliente:</strong> {order.customer?.name || order.customerId}
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
            <strong>Negocio:</strong> {order.businessId}
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
                    onClick={() => changeStatus(status, changedBy)}
                  >
                    {updating ? "Actualizando..." : getOrderStatusLabel(status)}
                  </button>
                ))}
              </div>
            )}
          </article>
        )}
      </section>

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
                  <span>{item.changedBy}</span>
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
