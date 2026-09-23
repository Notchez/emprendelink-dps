"use client";

import Link from "next/link";
import { ORDER_STATUS } from "@/lib/constants/orderStatus";
import { useOrders } from "@/hooks/useOrders";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { formatOrderDate, formatOrderMoney, getOrderStatusLabel } from "@/utils/orderUtils";
import styles from "./Orders.module.css";

export function OrdersView({ businessId }) {
  const { orders, statusFilter, search, loading, error, setStatusFilter, setSearch, refresh } =
    useOrders(businessId);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Gestión</p>
          <h1>Pedidos</h1>
          <p>Consulta los pedidos y revisa su estado actual.</p>
        </div>
        <button className={styles.secondaryButton} type="button" onClick={refresh}>
          Actualizar
        </button>
      </div>

      <section className={styles.filters} aria-label="Filtros de pedidos">
        <label>
          Buscar
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Pedido o cliente"
          />
        </label>

        <label>
          Estado
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="">Todos</option>
            {Object.values(ORDER_STATUS).map((status) => (
              <option key={status} value={status}>
                {getOrderStatusLabel(status)}
              </option>
            ))}
          </select>
        </label>
      </section>

      {loading && <p className={styles.message}>Cargando pedidos...</p>}
      {!loading && error && <p className={styles.error}>{error}</p>}

      {!loading && !error && orders.length === 0 && (
        <p className={styles.message}>No hay pedidos que coincidan con los filtros.</p>
      )}

      {!loading && !error && orders.length > 0 && (
        <section className={styles.orderGrid} aria-label="Listado de pedidos">
          {orders.map((order) => (
            <article className={styles.orderCard} key={order.id}>
              <div className={styles.cardTop}>
                <div>
                  <p className={styles.orderId}>{order.id}</p>
                  <p className={styles.muted}>{formatOrderDate(order.createdAt)}</p>
                </div>
                <OrderStatusBadge status={order.status} />
              </div>

              <div className={styles.cardInfo}>
                <span>Cliente: {order.customerId}</span>
                <strong>{formatOrderMoney(order.subtotal)}</strong>
              </div>

              <Link className={styles.linkButton} href={`/orders/${order.id}`}>
                Ver detalle
              </Link>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
