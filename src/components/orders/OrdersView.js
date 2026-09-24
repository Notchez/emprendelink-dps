"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { ORDER_STATUS } from "@/lib/constants/orderStatus";
import { useOrders } from "@/hooks/useOrders";
import { businessService } from "@/services/businessService";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";

import { formatOrderDate, formatOrderMoney, getOrderStatusLabel } from "@/utils/orderUtils";

import styles from "./Orders.module.css";

function formatOrderId(id) {
  return `PED-${String(id).slice(0, 8).toUpperCase()}`;
}

export function OrdersView({ businessId }) {
  const { orders, statusFilter, search, loading, error, setStatusFilter, setSearch, refresh } =
    useOrders(businessId);

  const [businessNames, setBusinessNames] = useState({});

  useEffect(() => {
    const businessIds = [...new Set(orders.map((order) => order.businessId).filter(Boolean))];

    if (businessIds.length === 0) {
      return;
    }

    let active = true;

    async function loadBusinessNames() {
      const results = await Promise.all(
        businessIds.map(async (id) => {
          try {
            const business = await businessService.getById(id);

            return [id, business?.name || "Negocio no disponible"];
          } catch {
            return [id, "Negocio no disponible"];
          }
        })
      );

      if (active) {
        setBusinessNames((previous) => ({
          ...previous,
          ...Object.fromEntries(results),
        }));
      }
    }

    void loadBusinessNames();

    return () => {
      active = false;
    };
  }, [orders]);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Gestión</p>

          <h1>Pedidos</h1>

          <p>Consulta los pedidos, sus productos y su estado actual.</p>
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
            placeholder="Identificador del pedido o cliente"
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

      {!loading && error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      {!loading && !error && orders.length === 0 && (
        <p className={styles.message}>No hay pedidos que coincidan con los filtros.</p>
      )}

      {!loading && !error && orders.length > 0 && (
        <section className={styles.orderGrid} aria-label="Listado de pedidos">
          {orders.map((order) => (
            <article className={styles.orderCard} key={order.id}>
              <div className={styles.cardTop}>
                <div>
                  <p className={styles.orderId} title={order.id}>
                    {formatOrderId(order.id)}
                  </p>

                  <p className={styles.muted}>{formatOrderDate(order.createdAt)}</p>
                </div>

                <OrderStatusBadge status={order.status} />
              </div>

              <div className={styles.cardInfo}>
                <div>
                  <p>
                    <strong>Cliente:</strong> {order.customer?.name || "Nombre no disponible"}
                  </p>

                  <p>
                    <strong>Emprendimiento:</strong>{" "}
                    {businessNames[order.businessId] || "Cargando negocio..."}
                  </p>
                </div>

                <strong>{formatOrderMoney(order.subtotal)}</strong>
              </div>

              <div>
                <strong>Productos solicitados:</strong>

                {order.items?.length > 0 ? (
                  <ul
                    style={{
                      margin: "0.5rem 0 1.25rem",
                      paddingLeft: "1.5rem",
                    }}
                  >
                    {order.items.map((item, index) => (
                      <li
                        key={`${item.productId}-${index}`}
                        style={{
                          marginBottom: "0.4rem",
                        }}
                      >
                        {item.productName} <strong>× {item.quantity}</strong>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className={styles.muted}>No hay productos registrados en este pedido.</p>
                )}
              </div>

              <Link className={styles.linkButton} href={`/orders/${encodeURIComponent(order.id)}`}>
                Ver detalle
              </Link>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
