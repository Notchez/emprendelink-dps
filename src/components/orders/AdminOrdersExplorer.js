"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { ORDER_STATUS } from "@/lib/constants/orderStatus";
import { apiRequest } from "@/services/apiClient";
import { businessService } from "@/services/businessService";
import { orderService } from "@/services/orderService";
import { buildDeliveredDates, filterAdminOrders } from "@/utils/adminFinancialReports";
import { formatOrderDate, formatOrderMoney, getOrderStatusLabel } from "@/utils/orderUtils";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";

import styles from "./AdminOrdersExplorer.module.css";

const INITIAL_FILTERS = {
  businessId: "",
  status: "",
  createdFrom: "",
  createdTo: "",
  deliveredFrom: "",
  deliveredTo: "",
};

const PAGE_SIZE = 24;

function orderLabel(id) {
  return `PED-${String(id).slice(0, 8).toUpperCase()}`;
}

export default function AdminOrdersExplorer() {
  const [businessResult, setBusinessResult] = useState({ loading: true, items: [], error: "" });
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [orderResult, setOrderResult] = useState({ loading: false, items: [], deliveredDates: {}, error: "" });
  const [refreshKey, setRefreshKey] = useState(0);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const hasFilters = Object.values(filters).some(Boolean);
  const invalidCreatedRange = Boolean(filters.createdFrom && filters.createdTo && filters.createdFrom > filters.createdTo);
  const invalidDeliveredRange = Boolean(filters.deliveredFrom && filters.deliveredTo && filters.deliveredFrom > filters.deliveredTo);
  const validSearch = hasFilters && !invalidCreatedRange && !invalidDeliveredRange;

  useEffect(() => {
    let active = true;
    businessService.getAll()
      .then((items) => {
        if (active) setBusinessResult({ loading: false, items, error: "" });
      })
      .catch((error) => {
        if (active) setBusinessResult({ loading: false, items: [], error: error.message });
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!validSearch) return undefined;
    let active = true;
    const params = new URLSearchParams();
    if (filters.businessId) params.set("businessId", filters.businessId);

    Promise.all([
      orderService.getOrders({ businessId: filters.businessId, status: filters.status }),
      apiRequest(`/api/commissions${params.size ? `?${params.toString()}` : ""}`),
    ])
      .then(([orders, commissions]) => {
        if (!active) return;
        setOrderResult({
          loading: false,
          items: filterAdminOrders(orders, filters, buildDeliveredDates(commissions)),
          deliveredDates: buildDeliveredDates(commissions),
          error: "",
        });
      })
      .catch((error) => {
        if (active) setOrderResult({ loading: false, items: [], deliveredDates: {}, error: error.message });
      });

    return () => { active = false; };
  }, [filters, validSearch, refreshKey]);

  const businesses = useMemo(
    () => [...businessResult.items].sort((a, b) => String(a.name || "").localeCompare(String(b.name || ""), "es")),
    [businessResult.items]
  );
  const activeBusinesses = businesses.filter((business) => business.active === true);
  const names = Object.fromEntries(businesses.map((business) => [business.id, business.name]));
  const visibleOrders = orderResult.items.slice(0, visibleCount);

  function updateFilter(key, value) {
    setFilters((previous) => ({ ...previous, [key]: value }));
    setVisibleCount(PAGE_SIZE);
    setOrderResult((previous) => ({ ...previous, loading: true, error: "" }));
  }

  function selectBusiness(id) {
    setFilters({ ...INITIAL_FILTERS, businessId: id });
    setVisibleCount(PAGE_SIZE);
    setOrderResult((previous) => ({ ...previous, loading: true, error: "" }));
  }

  function clearFilters() {
    setFilters(INITIAL_FILTERS);
    setVisibleCount(PAGE_SIZE);
    setOrderResult({ loading: false, items: [], deliveredDates: {}, error: "" });
  }

  function refresh() {
    setOrderResult((previous) => ({ ...previous, loading: true, error: "" }));
    setRefreshKey((value) => value + 1);
  }

  return (
    <div className={styles.page}>
      <header className={styles.heading}>
        <div>
          <p className="eyebrow">Panel del administrador</p>
          <h1>Pedidos por emprendimiento</h1>
          <p>Explora los negocios primero y consulta sus pedidos con filtros combinables.</p>
        </div>
        {validSearch && <button className={styles.secondaryButton} onClick={refresh} type="button">Actualizar pedidos</button>}
      </header>

      <section className={styles.filters} aria-labelledby="admin-orders-filters-title">
        <div className={styles.sectionTitle}>
          <h2 id="admin-orders-filters-title">Buscar pedidos</h2>
          <button className={styles.clearButton} type="button" onClick={clearFilters}>Limpiar filtros</button>
        </div>
        <div className={styles.filterGrid}>
          <label className={styles.wideField}>
            Negocio
            <select value={filters.businessId} onChange={(event) => updateFilter("businessId", event.target.value)}>
              <option value="">Todos los negocios</option>
              {businesses.map((business) => (
                <option key={business.id} value={business.id}>{business.name}{business.active ? "" : " (inactivo)"}</option>
              ))}
            </select>
          </label>
          <label>
            Estado
            <select value={filters.status} onChange={(event) => updateFilter("status", event.target.value)}>
              <option value="">Todos los estados</option>
              {Object.values(ORDER_STATUS).map((status) => <option key={status} value={status}>{getOrderStatusLabel(status)}</option>)}
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
        </div>
        <p className={styles.hint}>Las fechas se interpretan en horario de El Salvador. La entrega solo aplica a pedidos entregados.</p>
        {(invalidCreatedRange || invalidDeliveredRange) && <p className={styles.error} role="alert">La fecha inicial no puede ser posterior a la final.</p>}
      </section>

      {businessResult.error && <p className={styles.error} role="alert">{businessResult.error}</p>}
      {businessResult.loading && <p className={styles.message}>Cargando emprendimientos...</p>}

      {!hasFilters && !businessResult.loading && !businessResult.error && (
        <section aria-labelledby="active-businesses-title">
          <div className={styles.sectionTitle}>
            <div>
              <h2 id="active-businesses-title">Negocios activos</h2>
              <p>{activeBusinesses.length} emprendimientos disponibles. Selecciona uno para revisar sus pedidos.</p>
            </div>
          </div>
          {activeBusinesses.length === 0 && <p className={styles.message}>Aún no hay negocios activos. Usa el filtro para consultar negocios inactivos.</p>}
          <div className={styles.businessGrid}>
            {activeBusinesses.map((business) => (
              <button type="button" key={business.id} className={styles.businessCard} onClick={() => selectBusiness(business.id)}>
                <span className={styles.businessIcon}><i className="bi bi-shop" aria-hidden="true" /></span>
                <strong>{business.name}</strong>
                <span>Ver pedidos <i className="bi bi-arrow-right" aria-hidden="true" /></span>
              </button>
            ))}
          </div>
        </section>
      )}

      {validSearch && (
        <section aria-labelledby="admin-filtered-orders-title">
          <div className={styles.sectionTitle}>
            <div>
              <h2 id="admin-filtered-orders-title">Resultados de pedidos</h2>
              {!orderResult.loading && !orderResult.error && <p>{orderResult.items.length} pedidos encontrados.</p>}
            </div>
          </div>
          {orderResult.loading && <p className={styles.message} role="status">Consultando pedidos...</p>}
          {!orderResult.loading && orderResult.error && <p className={styles.error} role="alert">{orderResult.error}</p>}
          {!orderResult.loading && !orderResult.error && orderResult.items.length === 0 && <p className={styles.message}>No hay pedidos que coincidan con estos filtros.</p>}
          {!orderResult.loading && !orderResult.error && visibleOrders.length > 0 && (
            <>
              <div className={styles.orderGrid}>
                {visibleOrders.map((order) => (
                  <article key={order.id} className={styles.orderCard}>
                    <div className={styles.cardTop}>
                      <div><strong title={order.id}>{orderLabel(order.id)}</strong><p>{formatOrderDate(order.createdAt)}</p></div>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <h3>{names[order.businessId] || "Negocio no disponible"}</h3>
                    <p><strong>Cliente:</strong> {order.customer?.name || "Nombre no disponible"}</p>
                    {order.status === ORDER_STATUS.DELIVERED && (
                      <p><strong>Entregado:</strong> {order.deliveredAt || orderResult.deliveredDates[order.id] ? formatOrderDate(order.deliveredAt || orderResult.deliveredDates[order.id]) : "Fecha no disponible"}</p>
                    )}
                    <div className={styles.cardFooter}>
                      <strong>{formatOrderMoney(order.subtotal)}</strong>
                      <Link href={`/orders/${encodeURIComponent(order.id)}`}>Ver detalle <i className="bi bi-arrow-right" aria-hidden="true" /></Link>
                    </div>
                  </article>
                ))}
              </div>
              {orderResult.items.length > visibleCount && (
                <button type="button" className={styles.showMore} onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}>
                  Mostrar más pedidos ({orderResult.items.length - visibleCount} restantes)
                </button>
              )}
            </>
          )}
        </section>
      )}
    </div>
  );
}
