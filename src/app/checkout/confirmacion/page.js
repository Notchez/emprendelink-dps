"use client";

import { Suspense, useEffect, useState } from "react";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { orderService } from "@/services/orderService";
import { formatOrderDate, formatOrderMoney, getOrderStatusLabel } from "@/utils/orderUtils";

import styles from "../Checkout.module.css";

function formatOrderId(id) {
  return `PED-${String(id).slice(0, 8).toUpperCase()}`;
}

function Confirmation() {
  const id = useSearchParams().get("id");

  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!id) {
      return;
    }

    let active = true;

    orderService
      .getOrder(id)
      .then((order) => {
        if (active) {
          setResult({
            id,
            order,
            error: "",
          });
        }
      })
      .catch((error) => {
        if (active) {
          setResult({
            id,
            order: null,
            error: error instanceof Error ? error.message : "No se pudo consultar tu pedido.",
          });
        }
      });

    return () => {
      active = false;
    };
  }, [id]);

  const current = result?.id === id ? result : null;

  if (!id) {
    return (
      <div className={styles.page}>
        <section className={styles.emptyState}>
          <h1>No hay un pedido para consultar</h1>

          <p>Cuando confirmes una compra, podrás consultar su información aquí.</p>

          <Link className={styles.primaryButton} href="/cliente#mis-pedidos">
            Ver mis pedidos
          </Link>
        </section>
      </div>
    );
  }

  if (!current) {
    return (
      <div className={styles.page}>
        <p role="status">Consultando tu pedido...</p>
      </div>
    );
  }

  if (current.error || !current.order) {
    return (
      <div className={styles.page}>
        <section className={styles.emptyState}>
          <h1>No se pudo consultar el pedido</h1>

          <p className={styles.error} role="alert">
            {current.error || "El pedido no está disponible."}
          </p>

          <Link className={styles.primaryButton} href="/cliente#mis-pedidos">
            Volver a mis pedidos
          </Link>
        </section>
      </div>
    );
  }

  const { order } = current;

  const detailHref = `/cliente/pedidos/${encodeURIComponent(order.id)}`;

  return (
    <div className={styles.page}>
      <section className={styles.confirmationCard}>
        <header className={styles.confirmationHeader}>
          <div className={styles.confirmationIcon} aria-hidden="true">
            ✓
          </div>

          <p className={styles.eyebrow}>Compra registrada</p>

          <h1>¡Pedido recibido!</h1>

          <p>
            Tu pedido se registró correctamente y ya está disponible para que el emprendimiento
            pueda gestionarlo.
          </p>

          <span className={styles.orderNumber} title={order.id}>
            {formatOrderId(order.id)}
          </span>

          <p>{formatOrderDate(order.createdAt)}</p>
        </header>

        <div className={styles.successNotice}>
          <strong>Estado actual: {getOrderStatusLabel(order.status)}</strong>

          <p>Puedes consultar los cambios de estado desde el detalle de tu pedido.</p>
        </div>

        <div className={styles.confirmationGrid}>
          <section className={styles.confirmationSection}>
            <h2>Productos solicitados</h2>

            <ul className={styles.confirmationProducts}>
              {order.items?.map((item, index) => (
                <li key={`${item.productId}-${index}`}>
                  <span>
                    {item.productName} × {item.quantity}
                  </span>

                  <strong>{formatOrderMoney(item.lineTotal)}</strong>
                </li>
              ))}
            </ul>

            <div className={styles.confirmationTotal}>
              <span>Total del pedido</span>

              <strong>{formatOrderMoney(order.subtotal)}</strong>
            </div>
          </section>

          <section className={styles.confirmationSection}>
            <h2>Información de entrega</h2>

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
          </section>

          <section className={styles.confirmationSection}>
            <h2>Método de pago</h2>

            <strong>💵 Pago contra entrega</strong>

            <p>
              Pagarás al recibir tu pedido. No se realizó ningún cobro electrónico durante esta
              compra.
            </p>
          </section>

          <section className={styles.confirmationSection}>
            <h2>Seguimiento</h2>

            <p>
              El emprendimiento actualizará el estado de tu pedido durante su preparación y entrega.
            </p>

            <Link className={styles.primaryButton} href={detailHref}>
              Ver seguimiento del pedido
            </Link>
          </section>
        </div>

        <div className={styles.confirmationActions}>
          <Link className={styles.primaryButton} href={detailHref}>
            Ver detalle del pedido
          </Link>

          <Link className={styles.secondaryButton} href="/cliente#mis-pedidos">
            Ver mis pedidos
          </Link>

          <Link className={styles.secondaryButton} href="/">
            Explorar más negocios
          </Link>
        </div>
      </section>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<p role="status">Cargando confirmación...</p>}>
      <Confirmation />
    </Suspense>
  );
}
