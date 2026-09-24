"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/context/AuthContext";
import { orderService } from "@/services/orderService";

import styles from "./Checkout.module.css";

function formatMoney(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value || 0));
}

export default function CheckoutPage() {
  const { user } = useAuth();

  if (!user) {
    return <p role="status">Cargando tu cuenta...</p>;
  }

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

  const totalUnits = items.reduce((total, item) => total + Number(item.quantity || 0), 0);

  async function submit(event) {
    event.preventDefault();

    if (submitting.current) {
      return;
    }

    if (!businessId || items.length === 0) {
      setError("Tu carrito está vacío o no tiene un emprendimiento asociado.");

      return;
    }

    submitting.current = true;
    setSaving(true);
    setError("");

    try {
      const order = await orderService.createOrder({
        businessId,

        items: items.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),

        deliveryAddress: address.trim(),
        notes: notes.trim(),
      });

      clearCart();

      router.push(`/checkout/confirmacion?id=${encodeURIComponent(order.id)}`);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "No se pudo confirmar tu pedido.");
    } finally {
      submitting.current = false;
      setSaving(false);
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.heading}>
        <div>
          <p className={styles.eyebrow}>Finalizar compra</p>

          <h1>Confirmar pedido</h1>

          <p>Revisa tu compra y confirma dónde deseas recibirla.</p>
        </div>

        <Link className={styles.secondaryButton} href="/cliente/carrito">
          ← Volver al carrito
        </Link>
      </header>

      {items.length === 0 ? (
        <section className={styles.emptyState}>
          <div className={styles.emptyIcon} aria-hidden="true">
            🛒
          </div>

          <h2>Tu carrito está vacío</h2>

          <p>Agrega productos antes de confirmar un pedido.</p>

          <Link className={styles.primaryButton} href="/">
            Explorar negocios
          </Link>
        </section>
      ) : (
        <form className={styles.checkoutGrid} onSubmit={submit}>
          <div className={styles.formColumn}>
            <section className={styles.panel} aria-labelledby="delivery-title">
              <div className={styles.sectionHeading}>
                <span className={styles.stepNumber}>1</span>

                <div>
                  <h2 id="delivery-title">Datos de entrega</h2>

                  <p>Esta información permitirá coordinar la entrega de tu pedido.</p>
                </div>
              </div>

              <div className={styles.contactInfo}>
                <div>
                  <span>Nombre</span>

                  <strong>{user.name || "No registrado"}</strong>
                </div>

                <div>
                  <span>Correo electrónico</span>

                  <strong>{user.email || "No registrado"}</strong>
                </div>

                <div>
                  <span>Teléfono</span>

                  <strong>{user.phone || "No registrado"}</strong>
                </div>
              </div>

              <Link className={styles.profileLink} href="/cliente#mis-datos">
                Editar mis datos personales →
              </Link>

              <div className={styles.field}>
                <label htmlFor="deliveryAddress">Dirección para este pedido</label>

                <textarea
                  id="deliveryAddress"
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  minLength={5}
                  maxLength={500}
                  rows={4}
                  placeholder="Colonia, calle, número de casa y referencias..."
                  disabled={saving}
                  required
                />

                <small>
                  Puedes utilizar una dirección diferente de la que tienes guardada en tu perfil.
                </small>
              </div>

              <div className={styles.field}>
                <label htmlFor="deliveryNotes">
                  Indicaciones de entrega
                  <span className={styles.optional}> (opcional)</span>
                </label>

                <textarea
                  id="deliveryNotes"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  maxLength={500}
                  rows={3}
                  placeholder="Ej.: portón azul, llamar al llegar..."
                  disabled={saving}
                />
              </div>
            </section>

            <section className={styles.panel} aria-labelledby="payment-title">
              <div className={styles.sectionHeading}>
                <span className={styles.stepNumber}>2</span>

                <div>
                  <h2 id="payment-title">Método de pago</h2>

                  <p>Así realizarás el pago de esta compra.</p>
                </div>
              </div>

              <div className={styles.paymentMethod}>
                <span className={styles.paymentIcon} aria-hidden="true">
                  💵
                </span>

                <div>
                  <strong>Pago contra entrega</strong>

                  <p>Pagarás al recibir tu pedido. No necesitas ingresar datos de tarjeta.</p>
                </div>

                <span className={styles.selectedPayment} aria-label="Método de pago seleccionado">
                  ✓
                </span>
              </div>
            </section>
          </div>

          <aside className={styles.summaryPanel} aria-labelledby="summary-title">
            <h2 id="summary-title">Resumen de tu pedido</h2>

            <p className={styles.summaryDescription}>
              Comprueba los productos antes de confirmar tu compra.
            </p>

            <div className={styles.productsList}>
              {items.map((item) => (
                <article className={styles.product} key={item.id}>
                  <div className={styles.productImage}>
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.imageUrl} alt={item.name} />
                    ) : (
                      <span aria-hidden="true">🛍️</span>
                    )}
                  </div>

                  <div className={styles.productInfo}>
                    <strong>{item.name}</strong>

                    <span>
                      {item.quantity} × {formatMoney(item.price)}
                    </span>

                    <strong>{formatMoney(Number(item.price) * Number(item.quantity))}</strong>
                  </div>
                </article>
              ))}
            </div>

            <Link className={styles.editCartLink} href="/cliente/carrito">
              Modificar productos o cantidades →
            </Link>

            <div className={styles.totals}>
              <div className={styles.totalRow}>
                <span>Productos</span>

                <span>{totalUnits}</span>
              </div>

              <div className={styles.grandTotal}>
                <strong>Total estimado</strong>

                <strong>{formatMoney(subtotal)}</strong>
              </div>
            </div>

            <p className={styles.priceNotice}>
              El total definitivo se calculará con los precios vigentes al registrar tu pedido.
            </p>

            <div className={styles.paymentReminder}>
              <span aria-hidden="true">✓</span>

              <span>Pagarás contra entrega.</span>
            </div>

            {error && (
              <p className={styles.error} role="alert">
                {error}
              </p>
            )}

            <button className={styles.confirmButton} type="submit" disabled={saving}>
              {saving ? "Registrando pedido..." : "Confirmar pedido"}
            </button>

            <p className={styles.confirmationNote}>
              Al confirmar, tu pedido será enviado al emprendimiento para que pueda gestionarlo.
            </p>
          </aside>
        </form>
      )}
    </div>
  );
}
