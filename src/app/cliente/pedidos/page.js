"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { useOrders } from "@/hooks/useOrders";

import { businessService } from "@/services/businessService";

import { formatOrderMoney, getOrderStatusLabel } from "@/utils/orderUtils";

import { ORDER_STATUS } from "@/lib/constants/orderStatus";

import styles from "./CustomerOrders.module.css";

function formatDate(value) {
  if (!value) return "";

  return new Intl.DateTimeFormat("es-SV", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function OrderCard({ order, business }) {
  const visibleItems = order.items?.slice(0, 3) || [];
  const extraItems = Math.max(0, (order.items?.length || 0) - visibleItems.length);

  return (
    <article className={styles.orderCard}>
      <div className={styles.orderHeader}>
        <div className={styles.businessLogo}>
          {business?.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={business.logoUrl} alt={`Logotipo de ${business.name}`} />
          ) : (
            <i className="bi bi-shop" aria-hidden="true"></i>
          )}
        </div>

        <div className={styles.businessData}>
          <span className={styles.status} data-status={order.status}>
            {getOrderStatusLabel(order.status)} · {formatDate(order.createdAt)}
          </span>

          <h2>{business?.name || "Cargando negocio..."}</h2>
        </div>

        <strong className={styles.total}>{formatOrderMoney(order.subtotal)}</strong>
      </div>

      <div className={styles.items}>
        {visibleItems.map((item, index) => (
          <p key={`${item.productId}-${index}`}>
            <span>
              {item.quantity} × {item.productName}
            </span>

            <span>{formatOrderMoney(item.lineTotal)}</span>
          </p>
        ))}

        {extraItems > 0 && <small>+ {extraItems} producto(s) más</small>}
      </div>

      <div className={styles.orderFooter}>
        <Link href={`/cliente/pedidos/${encodeURIComponent(order.id)}`}>Ver pedido</Link>
      </div>
    </article>
  );
}

function OrdersSection({ title, orders, businesses, emptyText }) {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>{title}</h2>

      {orders.length === 0 ? (
        <div className={styles.emptySmall}>{emptyText}</div>
      ) : (
        <div className={styles.ordersList}>
          {orders.map((order) => (
            <OrderCard order={order} business={businesses[order.businessId]} key={order.id} />
          ))}
        </div>
      )}
    </section>
  );
}

export default function CustomerOrdersPage() {
  const { orders, loading, error, refresh } = useOrders();

  const [businesses, setBusinesses] = useState({});

  useEffect(() => {
    const ids = [...new Set(orders.map((order) => order.businessId).filter(Boolean))];

    if (ids.length === 0) {
      return;
    }

    let active = true;

    Promise.all(
      ids.map(async (businessId) => {
        try {
          const business = await businessService.getById(businessId);

          return [businessId, business];
        } catch {
          return [businessId, null];
        }
      })
    ).then((entries) => {
      if (active) {
        setBusinesses(Object.fromEntries(entries));
      }
    });

    return () => {
      active = false;
    };
  }, [orders]);

  const activeOrders = orders.filter(
    (order) => order.status !== ORDER_STATUS.DELIVERED && order.status !== ORDER_STATUS.CANCELLED
  );

  const completedOrders = orders.filter(
    (order) => order.status === ORDER_STATUS.DELIVERED || order.status === ORDER_STATUS.CANCELLED
  );

  return (
    <div className={styles.page}>
      <header className={styles.heading}>
        <div>
          <p className={styles.eyebrow}>TU ACTIVIDAD</p>

          <h1>Pedidos</h1>

          <p>Revisa el estado de tus compras y consulta tu historial.</p>
        </div>

        <button className={styles.refreshButton} type="button" disabled={loading} onClick={refresh}>
          <i className="bi bi-arrow-clockwise" aria-hidden="true"></i>

          <span>{loading ? "Actualizando..." : "Actualizar"}</span>
        </button>
      </header>

      {loading && (
        <div className={styles.message} role="status">
          Cargando tus pedidos...
        </div>
      )}

      {error && (
        <div className={styles.error} role="alert">
          {error}
        </div>
      )}

      {!loading && !error && orders.length === 0 && (
        <div className={styles.empty}>
          <i className="bi bi-receipt"></i>

          <h2>Todavía no tienes pedidos</h2>

          <p>Cuando realices una compra podrás seguirla desde aquí.</p>

          <Link href="/">Explorar negocios</Link>
        </div>
      )}

      {!loading && !error && orders.length > 0 && (
        <>
          <OrdersSection
            title="En curso"
            orders={activeOrders}
            businesses={businesses}
            emptyText="No tienes pedidos en curso."
          />

          <OrdersSection
            title="Historial"
            orders={completedOrders}
            businesses={businesses}
            emptyText="Todavía no tienes pedidos finalizados."
          />
        </>
      )}
    </div>
  );
}
