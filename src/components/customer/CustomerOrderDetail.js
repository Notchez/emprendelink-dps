"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { useOrderDetail } from "@/hooks/useOrderDetail";

import { businessService } from "@/services/businessService";

import { ORDER_STATUS } from "@/lib/constants/orderStatus";

import { formatOrderDate, formatOrderMoney, getOrderStatusLabel } from "@/utils/orderUtils";

import styles from "./CustomerOrderDetail.module.css";

const ORDER_FLOW = [
  {
    status: ORDER_STATUS.PENDING,
    label: "Pedido recibido",
    icon: "bi bi-receipt",
  },
  {
    status: ORDER_STATUS.CONFIRMED,
    label: "Confirmado",
    icon: "bi bi-check-circle",
  },
  {
    status: ORDER_STATUS.PREPARING,
    label: "En preparación",
    icon: "bi bi-bag",
  },
  {
    status: ORDER_STATUS.READY,
    label: "Listo",
    icon: "bi bi-box-seam",
  },
  {
    status: ORDER_STATUS.DELIVERED,
    label: "Entregado",
    icon: "bi bi-house-check",
  },
];

function formatOrderId(id) {
  return `PED-${String(id).slice(0, 8).toUpperCase()}`;
}

function OrderProgress({ order, history }) {
  const cancelled = order.status === ORDER_STATUS.CANCELLED;

  const currentIndex = ORDER_FLOW.findIndex((step) => step.status === order.status);

  if (cancelled) {
    const cancellation = history.find((item) => item.newStatus === ORDER_STATUS.CANCELLED);

    return (
      <div className={styles.cancelled}>
        <div className={styles.cancelledIcon}>
          <i className="bi bi-x-lg" aria-hidden="true"></i>
        </div>

        <div>
          <strong>Pedido cancelado</strong>

          <p>Este pedido ya no continuará con el proceso.</p>

          {cancellation?.changedAt && <small>{formatOrderDate(cancellation.changedAt)}</small>}
        </div>
      </div>
    );
  }

  return (
    <ol className={styles.timeline} aria-label="Seguimiento del pedido">
      {ORDER_FLOW.map((step, index) => {
        const completed = currentIndex >= index;

        const current = currentIndex === index;

        const historyEntry = history.find((item) => item.newStatus === step.status);

        return (
          <li
            className={`${styles.timelineItem} ${completed ? styles.completed : ""} ${
              current ? styles.current : ""
            }`}
            key={step.status}
          >
            <div className={styles.timelineMarker}>
              <i className={completed ? "bi bi-check-lg" : step.icon} aria-hidden="true"></i>
            </div>

            <div className={styles.timelineContent}>
              <strong>{step.label}</strong>

              {historyEntry?.changedAt ? (
                <small>{formatOrderDate(historyEntry.changedAt)}</small>
              ) : (
                <small>{current ? "Estado actual" : "Pendiente"}</small>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function CustomerOrderDetail({ orderId }) {
  const { order, history, loading, error, refresh } = useOrderDetail(orderId);

  const [businessResult, setBusinessResult] = useState(null);

  useEffect(() => {
    if (!order?.businessId) {
      return;
    }

    let active = true;

    businessService
      .getById(order.businessId)
      .then((business) => {
        if (!active) return;

        setBusinessResult({
          businessId: order.businessId,
          business,
        });
      })
      .catch(() => {
        if (!active) return;

        setBusinessResult({
          businessId: order.businessId,
          business: null,
        });
      });

    return () => {
      active = false;
    };
  }, [order?.businessId]);

  if (loading) {
    return (
      <div className={styles.message} role="status">
        Cargando pedido...
      </div>
    );
  }

  if (!order) {
    return (
      <div className={styles.errorState}>
        <i className="bi bi-exclamation-circle" aria-hidden="true"></i>

        <h1>No encontramos este pedido</h1>

        <p>{error || "El pedido no está disponible."}</p>

        <Link href="/cliente/pedidos">Volver a mis pedidos</Link>
      </div>
    );
  }

  const business = businessResult?.businessId === order.businessId ? businessResult.business : null;

  return (
    <div className={styles.page}>
      <Link className={styles.backLink} href="/cliente/pedidos">
        <i className="bi bi-chevron-left" aria-hidden="true"></i>
        Mis pedidos
      </Link>

      <header className={styles.orderHeader}>
        <div className={styles.businessLogo}>
          {business?.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={business.logoUrl} alt={`Logotipo de ${business.name}`} />
          ) : (
            <i className="bi bi-shop" aria-hidden="true"></i>
          )}
        </div>

        <div className={styles.headerInfo}>
          <span className={styles.status} data-status={order.status}>
            {getOrderStatusLabel(order.status)}
          </span>

          <h1>{business?.name || "Cargando negocio..."}</h1>

          <p>{formatOrderDate(order.createdAt)}</p>
        </div>

        <button
          className={styles.refreshButton}
          type="button"
          onClick={refresh}
          disabled={loading}
          aria-label="Actualizar pedido"
        >
          <i className="bi bi-arrow-clockwise" aria-hidden="true"></i>
        </button>
      </header>

      {error && (
        <div className={styles.error} role="alert">
          {error}
        </div>
      )}

      <section className={styles.card}>
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>ESTADO ACTUAL</p>

            <h2>{getOrderStatusLabel(order.status)}</h2>
          </div>
        </div>

        <OrderProgress order={order} history={history} />
      </section>

      <section className={styles.card}>
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>TU COMPRA</p>

            <h2>Productos</h2>
          </div>
        </div>

        <div className={styles.products}>
          {order.items?.map((item, index) => (
            <article className={styles.product} key={`${item.productId}-${index}`}>
              <div className={styles.productQuantity}>{item.quantity}×</div>

              <div className={styles.productInfo}>
                <strong>{item.productName}</strong>

                <span>{formatOrderMoney(item.unitPrice)} por unidad</span>
              </div>

              <strong className={styles.productTotal}>{formatOrderMoney(item.lineTotal)}</strong>
            </article>
          ))}
        </div>

        <div className={styles.orderTotal}>
          <span>Total del pedido</span>

          <strong>{formatOrderMoney(order.subtotal)}</strong>
        </div>
      </section>

      <section className={styles.card}>
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>ENTREGA</p>

            <h2>Información de entrega</h2>
          </div>
        </div>

        <div className={styles.deliveryList}>
          <div className={styles.deliveryItem}>
            <i className="bi bi-person" aria-hidden="true"></i>

            <div>
              <span>Cliente</span>

              <strong>{order.customer?.name || "Cliente"}</strong>
            </div>
          </div>

          <div className={styles.deliveryItem}>
            <i className="bi bi-telephone" aria-hidden="true"></i>

            <div>
              <span>Teléfono</span>

              <strong>{order.customer?.phone || "—"}</strong>
            </div>
          </div>

          <div className={styles.deliveryItem}>
            <i className="bi bi-geo-alt" aria-hidden="true"></i>

            <div>
              <span>Dirección</span>

              <strong>{order.deliveryAddress}</strong>
            </div>
          </div>

          {order.notes && (
            <div className={styles.deliveryItem}>
              <i className="bi bi-chat-left-text" aria-hidden="true"></i>

              <div>
                <span>Indicaciones de entrega</span>

                <strong>{order.notes}</strong>
              </div>
            </div>
          )}

          <div className={styles.deliveryItem}>
            <i className="bi bi-cash" aria-hidden="true"></i>

            <div>
              <span>Método de pago</span>

              <strong>Pago contra entrega</strong>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.orderReference}>
        <div>
          <span>Código del pedido</span>

          <strong title={order.id}>{formatOrderId(order.id)}</strong>
        </div>

        <span>Este código sirve como referencia del pedido.</span>
      </section>
    </div>
  );
}
