"use client";

import { useState } from "react";
import Link from "next/link";

import { useAuth } from "@/context/AuthContext";
import { useOrders } from "@/hooks/useOrders";

import { userService } from "@/services/userService";
import { authErrorMessage } from "@/services/authService";

import { ContactFields } from "@/components/auth/ContactFields";

import { formatOrderDate, formatOrderMoney, getOrderStatusLabel } from "@/utils/orderUtils";

import { ORDER_STATUS } from "@/lib/constants/orderStatus";

import styles from "./CustomerHome.module.css";

function formatOrderId(id) {
  return `PED-${String(id).slice(0, 8).toUpperCase()}`;
}

function ProfileForm({ user }) {
  const [values, setValues] = useState({
    name: user.name || "",
    phone: user.phone || "",
    address: user.address || "",
    deliveryInstructions: user.deliveryInstructions || "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  function change(event) {
    setValues((previous) => ({
      ...previous,
      [event.target.name]: event.target.value,
    }));
  }

  async function saveProfile(event) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setMessage("");

    try {
      await userService.updateProfile(user, values);

      setMessage("Tus datos se guardaron correctamente.");
    } catch (failure) {
      setError(authErrorMessage(failure));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className={styles.panel} id="mis-datos" aria-labelledby="customer-profile-title">
      <div className={styles.sectionHeader}>
        <div>
          <p className={styles.eyebrow}>Información personal</p>

          <h2 id="customer-profile-title">Mis datos</h2>

          <p>Mantén actualizada tu información para facilitar la entrega de tus pedidos.</p>
        </div>
      </div>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      {message && (
        <p className={styles.success} role="status">
          {message}
        </p>
      )}

      <form className={styles.profileForm} onSubmit={saveProfile}>
        <label htmlFor="name">Nombre completo</label>

        <input
          id="name"
          name="name"
          autoComplete="name"
          value={values.name}
          onChange={change}
          minLength={2}
          maxLength={100}
          required
        />

        <label htmlFor="email">Correo electrónico</label>

        <input id="email" type="email" value={user.email || ""} readOnly />

        <ContactFields values={values} onChange={change} />

        <div className={styles.formActions}>
          <button className={styles.primaryButton} type="submit" disabled={saving}>
            {saving ? "Guardando..." : "Guardar mis datos"}
          </button>
        </div>
      </form>
    </section>
  );
}

function CustomerOrders({ orders, loading, error, refresh }) {
  return (
    <section className={styles.panel} id="mis-pedidos" aria-labelledby="customer-orders-title">
      <div className={styles.sectionHeader}>
        <div>
          <p className={styles.eyebrow}>Historial y seguimiento</p>

          <h2 id="customer-orders-title">Mis pedidos</h2>

          <p>Consulta tus compras y revisa el estado de cada pedido.</p>
        </div>

        <button
          className={styles.secondaryButton}
          type="button"
          onClick={refresh}
          disabled={loading}
        >
          {loading ? "Actualizando..." : "Actualizar pedidos"}
        </button>
      </div>

      {loading && <p role="status">Cargando pedidos...</p>}

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      {!loading && !error && orders.length === 0 && (
        <div className={styles.emptyState}>
          <p>Todavía no tienes pedidos registrados.</p>

          <Link className={styles.primaryButton} href="/">
            Explorar negocios
          </Link>
        </div>
      )}

      {!loading && !error && orders.length > 0 && (
        <div className={styles.ordersGrid}>
          {orders.map((order) => (
            <article className={styles.orderCard} key={order.id}>
              <div className={styles.orderTop}>
                <div>
                  <h3 title={order.id}>{formatOrderId(order.id)}</h3>

                  <p>{formatOrderDate(order.createdAt)}</p>
                </div>

                <span className={styles.status}>{getOrderStatusLabel(order.status)}</span>
              </div>

              <div className={styles.products}>
                <strong>Productos comprados</strong>

                {order.items?.length > 0 ? (
                  <ul>
                    {order.items.map((item, index) => (
                      <li key={`${item.productId}-${index}`}>
                        <span>{item.productName}</span>

                        <strong>× {item.quantity}</strong>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No se encontraron los productos de este pedido.</p>
                )}
              </div>

              <div className={styles.orderFooter}>
                <div>
                  <span>Total del pedido</span>

                  <strong>{formatOrderMoney(order.subtotal)}</strong>
                </div>

                <Link
                  className={styles.secondaryButton}
                  href={`/cliente/pedidos/${encodeURIComponent(order.id)}`}
                >
                  Ver detalle
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default function CustomerPage() {
  const { user } = useAuth();

  const { orders, loading, error, refresh } = useOrders();

  if (!user) {
    return <p role="status">Cargando tu cuenta...</p>;
  }

  const deliveredOrders = orders.filter((order) => order.status === ORDER_STATUS.DELIVERED).length;

  const ordersInProgress = orders.filter(
    (order) => order.status !== ORDER_STATUS.DELIVERED && order.status !== ORDER_STATUS.CANCELLED
  ).length;

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <p className={styles.eyebrow}>Panel del cliente</p>

        <h1>¡Hola, {user.name}!</h1>

        <p>
          Explora emprendimientos, realiza tus compras y consulta tus pedidos desde un solo lugar.
        </p>

        <div className={styles.heroActions}>
          <Link className={styles.primaryButton} href="/">
            Explorar negocios
          </Link>

          <Link className={styles.secondaryButton} href="/checkout">
            Revisar mi compra
          </Link>
        </div>
      </header>

      <section className={styles.summary} aria-label="Resumen de tus pedidos">
        <a className={styles.summaryCard} href="#mis-pedidos">
          <span>Mis pedidos</span>

          <strong>{orders.length}</strong>

          <small>Consultar historial</small>
        </a>

        <a className={styles.summaryCard} href="#mis-pedidos">
          <span>En proceso</span>

          <strong>{ordersInProgress}</strong>

          <small>Revisar seguimiento</small>
        </a>

        <a className={styles.summaryCard} href="#mis-pedidos">
          <span>Entregados</span>

          <strong>{deliveredOrders}</strong>

          <small>Ver compras completadas</small>
        </a>
      </section>

      <CustomerOrders orders={orders} loading={loading} error={error} refresh={refresh} />

      <ProfileForm key={user.id} user={user} />
    </div>
  );
}
