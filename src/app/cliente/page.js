"use client";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { userService } from "@/services/userService";
import { authErrorMessage } from "@/services/authService";
import { ContactFields } from "@/components/auth/ContactFields";
import { AccountActions } from "@/components/auth/AccountActions";
import { useOrders } from "@/hooks/useOrders";
import { formatOrderMoney, getOrderStatusLabel } from "@/utils/orderUtils";
import styles from "@/components/auth/Account.module.css";

export default function CustomerPage() {
  const { user } = useAuth();
  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <AccountActions />
        <h1>Mi cuenta</h1>
        <p>
          <Link href="/">Explorar negocios</Link> · <Link href="/checkout">Ver mi carrito</Link>
        </p>
        <ProfileForm key={user.id} user={user} />
        <CustomerOrders />
      </div>
    </main>
  );
}
function ProfileForm({ user }) {
  const [values, setValues] = useState({
    name: user.name,
    phone: user.phone || "",
    address: user.address || "",
    deliveryInstructions: user.deliveryInstructions || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  function change(event) {
    setValues((previous) => ({ ...previous, [event.target.name]: event.target.value }));
  }
  return (
    <section>
      <h2>Mis datos</h2>
      {error && (
        <p role="alert" className={styles.error}>
          {error}
        </p>
      )}
      {message && (
        <p role="status" className={styles.success}>
          {message}
        </p>
      )}
      <form
        className={styles.form}
        onSubmit={async (event) => {
          event.preventDefault();
          setSaving(true);
          setError("");
          setMessage("");
          try {
            await userService.updateProfile(user, values);
            setMessage("Datos guardados.");
          } catch (failure) {
            setError(authErrorMessage(failure));
          } finally {
            setSaving(false);
          }
        }}
      >
        <label htmlFor="name">Nombre completo</label>
        <input
          id="name"
          name="name"
          autoComplete="name"
          value={values.name}
          onChange={change}
          required
          minLength={2}
          maxLength={100}
        />
        <label htmlFor="email">Correo electrónico</label>
        <input id="email" type="email" value={user.email} readOnly />
        <ContactFields values={values} onChange={change} />
        <button type="submit" disabled={saving}>
          {saving ? "Guardando..." : "Guardar datos"}
        </button>
      </form>
    </section>
  );
}
function CustomerOrders() {
  const { orders, loading, error, refresh } = useOrders();
  return (
    <section>
      <h2>Mis pedidos</h2>
      <button type="button" onClick={refresh} disabled={loading}>
        Actualizar pedidos
      </button>
      {loading && <p role="status">Cargando pedidos...</p>}
      {error && <p role="alert">{error}</p>}
      {!loading && !error && orders.length === 0 && <p>Todavía no tienes pedidos.</p>}
      <ul className={styles.orders}>
        {orders.map((order) => (
          <li key={order.id} className={styles.order}>
            <Link href={`/cliente/pedidos/${encodeURIComponent(order.id)}`}>{order.id}</Link>
            <p>
              {getOrderStatusLabel(order.status)} · {formatOrderMoney(order.subtotal)}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
