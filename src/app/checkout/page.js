"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/context/AuthContext";
import { orderService } from "@/services/orderService";
import { AccountActions } from "@/components/auth/AccountActions";
import styles from "@/components/auth/Account.module.css";

export default function CheckoutPage() {
  const { user } = useAuth();
  return <CheckoutForm key={user.id} user={user} />;
}
function CheckoutForm({ user }) {
  const router = useRouter();
  const { items, subtotal, businessId, clearCart } = useCart();
  const [address, setAddress] = useState(user.address || "");
  const [notes, setNotes] = useState(user.deliveryInstructions || "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const submitting = useRef(false);
  async function submit(event) {
    event.preventDefault();
    if (submitting.current) return;
    if (!businessId || !items.length) {
      setError("Tu carrito está vacío o no tiene un negocio asociado.");
      return;
    }
    submitting.current = true;
    setSaving(true);
    setError("");
    try {
      const order = await orderService.createOrder({
        businessId,
        items: items.map((item) => ({ productId: item.id, quantity: item.quantity })),
        deliveryAddress: address.trim(),
        notes: notes.trim(),
      });
      clearCart();
      router.push(`/checkout/confirmacion?id=${encodeURIComponent(order.id)}`);
    } catch (failure) {
      setError(failure.message);
    } finally {
      submitting.current = false;
      setSaving(false);
    }
  }
  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <AccountActions />
        <h1>Confirmar pedido</h1>
        {!items.length ? (
          <>
            <p>Tu carrito está vacío.</p>
            <Link href="/">Explorar negocios</Link>
          </>
        ) : (
          <>
            <p>
              <strong>{user.name}</strong>
              <br />
              {user.email}
              <br />
              {user.phone}
            </p>
            <p>
              <Link href="/cliente">Editar mis datos</Link>
            </p>
            <ul>
              {items.map((item) => (
                <li key={item.id}>
                  {item.quantity} × {item.name} — ${(item.price * item.quantity).toFixed(2)}
                </li>
              ))}
            </ul>
            <p>
              <strong>Total estimado: ${subtotal.toFixed(2)}</strong>
            </p>
            <p>El total final se calcula con los precios vigentes del catálogo.</p>
            {error && (
              <p className={styles.error} role="alert">
                {error}
              </p>
            )}
            <form className={styles.form} onSubmit={submit}>
              <label htmlFor="deliveryAddress">Dirección para este pedido</label>
              <textarea
                id="deliveryAddress"
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                required
                minLength={5}
                maxLength={500}
                rows={3}
              />
              <label htmlFor="notes">Indicaciones de entrega (opcional)</label>
              <textarea
                id="notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                maxLength={500}
                rows={2}
              />
              <button disabled={saving} type="submit">
                {saving ? "Confirmando..." : "Confirmar pedido"}
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
