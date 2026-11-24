"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { ORDER_STATUS } from "@/lib/constants/orderStatus";
import { useOrders } from "@/hooks/useOrders";
import { businessService } from "@/services/businessService";
import { statementService } from "@/services/statementService";
import { buildDeliveredDates } from "@/utils/adminFinancialReports";
import { filterEntrepreneurOrders } from "@/utils/entrepreneurReports";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";

import { formatOrderDate, formatOrderMoney, getOrderStatusLabel } from "@/utils/orderUtils";

import styles from "./Orders.module.css";

function formatOrderId(id) {
  return `PED-${String(id).slice(0, 8).toUpperCase()}`;
}

const EMPTY_DELIVERED_DATES = {};

export function OrdersView({ businessId }) {
  const { orders, statusFilter, search, loading, error, setStatusFilter, setSearch, refresh } =
    useOrders(businessId);

  const [businessNames, setBusinessNames] = useState({});
  const [filters, setFilters] = useState({
    customerName: "", createdFrom: "", createdTo: "", deliveredFrom: "", deliveredTo: "",
  });
  const [commissionsResult, setCommissionsResult] = useState({ businessId: "", dates: {}, error: "" });

  useEffect(() => {
    let active = true;
    statementService.getCommissions(businessId)
      .then((commissions) => {
        if (active) setCommissionsResult({ businessId, dates: buildDeliveredDates(commissions), error: "" });
      })
      .catch((caughtError) => {
        if (active) setCommissionsResult({ businessId, dates: {}, error: caughtError.message });
      });
    return () => { active = false; };
  }, [businessId]);

  const invalidDates = Boolean(
    (filters.createdFrom && filters.createdTo && filters.createdFrom > filters.createdTo) ||
    (filters.deliveredFrom && filters.deliveredTo && filters.deliveredFrom > filters.deliveredTo)
  );
  const deliveredDates = commissionsResult.businessId === businessId ? commissionsResult.dates : EMPTY_DELIVERED_DATES;
  const visibleOrders = useMemo(
    () => invalidDates ? [] : filterEntrepreneurOrders(orders, { ...filters, status: statusFilter }, deliveredDates),
    [orders, filters, statusFilter, deliveredDates, invalidDates]
  );

  function updateFilter(field, value) {
    setFilters((current) => ({ ...current, [field]: value }));
  }

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
            placeholder="ID, correo o teléfono"
          />
        </label>

        <label>
          Nombre del cliente
          <input type="search" value={filters.customerName} onChange={(event) => updateFilter("customerName", event.target.value)} placeholder="Ej. María Pérez" />
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

        <label>Pedido realizado desde
          <input type="date" value={filters.createdFrom} onChange={(event) => updateFilter("createdFrom", event.target.value)} />
        </label>
        <label>Pedido realizado hasta
          <input type="date" min={filters.createdFrom || undefined} value={filters.createdTo} onChange={(event) => updateFilter("createdTo", event.target.value)} />
        </label>
        <label>Pedido entregado desde
          <input type="date" value={filters.deliveredFrom} onChange={(event) => updateFilter("deliveredFrom", event.target.value)} />
        </label>
        <label>Pedido entregado hasta
          <input type="date" min={filters.deliveredFrom || undefined} value={filters.deliveredTo} onChange={(event) => updateFilter("deliveredTo", event.target.value)} />
        </label>
      </section>

      <div className={styles.filterActions}>
        <span>{!loading && !error ? `${visibleOrders.length} de ${orders.length} pedidos` : "Consultando pedidos..."}</span>
        <button
          className={styles.secondaryButton}
          type="button"
          onClick={() => {
            setFilters({ customerName: "", createdFrom: "", createdTo: "", deliveredFrom: "", deliveredTo: "" });
            setSearch("");
            setStatusFilter("");
          }}
        >
          Limpiar filtros
        </button>
      </div>

      {invalidDates && <p role="alert" className={styles.error}>La fecha inicial no puede ser posterior a la final.</p>}
      {commissionsResult.businessId === businessId && commissionsResult.error && (
        <p role="alert" className={styles.message}>No se pudieron consultar las fechas de entrega: {commissionsResult.error}</p>
      )}

      {loading && <p className={styles.message}>Cargando pedidos...</p>}

      {!loading && error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      {!loading && !error && !invalidDates && visibleOrders.length === 0 && (
        <p className={styles.message}>No hay pedidos que coincidan con los filtros.</p>
      )}

      {!loading && !error && !invalidDates && visibleOrders.length > 0 && (
        <section className={styles.orderGrid} aria-label="Listado de pedidos">
          {visibleOrders.map((order) => (
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

                  <p><strong>Teléfono:</strong> {order.customer?.phone || "No disponible"}</p>

                  <p><strong>Correo:</strong> {order.customer?.email || "No disponible"}</p>

                  <p>
                    <strong>Emprendimiento:</strong>{" "}
                    {businessNames[order.businessId] || "Cargando negocio..."}
                  </p>
                </div>

                <strong>{formatOrderMoney(order.subtotal)}</strong>
              </div>

              <p><strong>Dirección de entrega:</strong> {order.deliveryAddress || "No disponible"}</p>

              {order.notes && <p><strong>Indicaciones:</strong> {order.notes}</p>}

              <div>
                <strong>Productos solicitados:</strong>

                {order.items?.length > 0 ? (
                  <ul className={styles.productsList}>
                    {order.items.map((item, index) => (
                      <li key={`${item.productId}-${index}`}>
                        {item.productName} <strong>× {item.quantity}</strong>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className={styles.muted}>No hay productos registrados en este pedido.</p>
                )}
              </div>

              {order.status === ORDER_STATUS.DELIVERED && (
                <p className={styles.muted}><strong>Entregado:</strong> {order.deliveredAt || deliveredDates[order.id] ? formatOrderDate(order.deliveredAt || deliveredDates[order.id]) : "Fecha no disponible"}</p>
              )}

              <Link className={styles.linkButton} href={`/orders/${encodeURIComponent(order.id)}`}>
                Ver detalle del pedido →
              </Link>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
