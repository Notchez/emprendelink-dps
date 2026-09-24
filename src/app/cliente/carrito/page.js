"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useCart } from "@/hooks/useCart";
import { businessService } from "@/services/businessService";

import styles from "./CartPage.module.css";

function formatMoney(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value || 0));
}

export default function CustomerCartPage() {
  const router = useRouter();

  const { items, businessId, subtotal, totalItemsCount, updateQuantity, removeItem, clearCart } =
    useCart();

  const [businessResult, setBusinessResult] = useState(null);

  useEffect(() => {
    if (!businessId) {
      return;
    }

    let active = true;

    businessService
      .getById(businessId)
      .then((business) => {
        if (active) {
          setBusinessResult({
            businessId,
            business,
          });
        }
      })
      .catch(() => {
        if (active) {
          setBusinessResult({
            businessId,
            business: null,
          });
        }
      });

    return () => {
      active = false;
    };
  }, [businessId]);

  const business = businessResult?.businessId === businessId ? businessResult.business : null;

  const catalogHref =
    business?.active && business?.slug ? `/catalogo/${encodeURIComponent(business.slug)}` : "/";

  const canCheckout = items.length > 0 && Boolean(businessId) && business?.active === true;

  function handleClearCart() {
    const confirmed = window.confirm("¿Deseas eliminar todos los productos de tu carrito?");

    if (confirmed) {
      clearCart();
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.heading}>
        <div>
          <p className={styles.eyebrow}>Panel del cliente</p>

          <h1>Revisar mi compra</h1>

          <p>Comprueba los productos, las cantidades y el subtotal antes de confirmar tu pedido.</p>
        </div>

        <Link className={styles.secondaryButton} href="/">
          Explorar negocios
        </Link>
      </header>

      {items.length === 0 ? (
        <section className={styles.emptyState}>
          <div className={styles.emptyIcon} aria-hidden="true">
            🛒
          </div>

          <h2>Tu carrito está vacío</h2>

          <p>
            Explora los emprendimientos y agrega productos de sus catálogos para comenzar tu compra.
          </p>

          <Link className={styles.primaryButton} href="/">
            Explorar negocios
          </Link>
        </section>
      ) : (
        <div className={styles.contentGrid}>
          <section className={styles.productsPanel} aria-labelledby="cart-products-title">
            <div className={styles.panelHeading}>
              <div>
                <h2 id="cart-products-title">Productos seleccionados</h2>

                <p>
                  {totalItemsCount} {totalItemsCount === 1 ? "unidad" : "unidades"} en tu carrito
                </p>
              </div>

              <button className={styles.clearButton} type="button" onClick={handleClearCart}>
                Vaciar carrito
              </button>
            </div>

            <div className={styles.businessNotice}>
              <span>Emprendimiento</span>

              <strong>
                {business
                  ? business.name
                  : businessResult?.businessId === businessId
                    ? "Negocio no disponible"
                    : "Cargando negocio..."}
              </strong>

              <p>Cada pedido contiene productos de un solo emprendimiento.</p>

              {business?.active && (
                <Link href={catalogHref}>Seguir comprando en este catálogo →</Link>
              )}
            </div>

            <div className={styles.productsList}>
              {items.map((item) => (
                <article className={styles.product} key={item.id}>
                  <div className={styles.productVisual}>
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.imageUrl} alt={item.name} loading="lazy" />
                    ) : (
                      <span aria-hidden="true">🛍️</span>
                    )}
                  </div>

                  <div className={styles.productInfo}>
                    <h3>{item.name}</h3>

                    <p>Precio unitario: {formatMoney(item.price)}</p>

                    <button
                      className={styles.removeButton}
                      type="button"
                      onClick={() => removeItem(item.id)}
                    >
                      Eliminar producto
                    </button>
                  </div>

                  <div className={styles.productControls}>
                    <div
                      className={styles.quantityControls}
                      aria-label={`Cantidad de ${item.name}`}
                    >
                      <button
                        type="button"
                        aria-label={`Restar una unidad de ${item.name}`}
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        −
                      </button>

                      <span>{item.quantity}</span>

                      <button
                        type="button"
                        aria-label={`Agregar una unidad de ${item.name}`}
                        disabled={item.quantity >= 999}
                        onClick={() => updateQuantity(item.id, Math.min(999, item.quantity + 1))}
                      >
                        +
                      </button>
                    </div>

                    <strong>{formatMoney(Number(item.price) * Number(item.quantity))}</strong>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <aside className={styles.summaryPanel} aria-labelledby="cart-summary-title">
            <h2 id="cart-summary-title">Resumen de tu compra</h2>

            <div className={styles.summaryRow}>
              <span>Productos</span>

              <span>{totalItemsCount}</span>
            </div>

            <div className={styles.summaryTotal}>
              <strong>Subtotal estimado</strong>

              <strong>{formatMoney(subtotal)}</strong>
            </div>

            <p className={styles.priceNotice}>
              Los precios y la disponibilidad se comprobarán nuevamente al confirmar el pedido.
            </p>

            <div className={styles.paymentBox}>
              <span className={styles.paymentIcon}>💵</span>

              <div>
                <strong>Pago contra entrega</strong>

                <p>
                  No necesitas ingresar datos de tarjeta. El pago se realizará al recibir tu pedido.
                </p>
              </div>
            </div>

            {!business?.active && businessResult?.businessId === businessId && (
              <p className={styles.error} role="alert">
                Este emprendimiento ya no está disponible. Revisa tu carrito antes de continuar.
              </p>
            )}

            <button
              className={styles.checkoutButton}
              type="button"
              disabled={!canCheckout}
              onClick={() => router.push("/checkout")}
            >
              Continuar y confirmar pedido
            </button>

            <Link className={styles.backLink} href={catalogHref}>
              Seguir explorando productos
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
