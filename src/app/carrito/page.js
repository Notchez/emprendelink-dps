"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { CustomerShell } from "@/components/customer/CustomerShell";

import { useCart } from "@/hooks/useCart";

import { businessService } from "@/services/businessService";

import styles from "./CartPage.module.css";

function formatMoney(value) {
  return new Intl.NumberFormat("es-SV", {
    style: "currency",
    currency: "USD",
  }).format(Number(value) || 0);
}

export default function CartPage() {
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
        if (!active) return;

        setBusinessResult({
          businessId,
          business,
        });
      })
      .catch(() => {
        if (!active) return;

        setBusinessResult({
          businessId,
          business: null,
        });
      });

    return () => {
      active = false;
    };
  }, [businessId]);

  const business = businessResult?.businessId === businessId ? businessResult.business : null;

  const catalogHref =
    business?.active && business.slug ? `/catalogo/${encodeURIComponent(business.slug)}` : "/";

  const canCheckout = items.length > 0 && Boolean(businessId) && business?.active === true;

  function emptyCart() {
    const confirmed = window.confirm("¿Deseas vaciar tu carrito?");

    if (confirmed) {
      clearCart();
    }
  }

  return (
    <CustomerShell>
      <div className={styles.page}>
        <header className={styles.heading}>
          <div>
            <p className={styles.eyebrow}>TU COMPRA</p>

            <h1>Carrito</h1>

            {items.length > 0 && (
              <p>
                {totalItemsCount} {totalItemsCount === 1 ? "producto" : "productos"}
              </p>
            )}
          </div>
        </header>

        {items.length === 0 ? (
          <section className={styles.empty}>
            <i className="bi bi-cart3" aria-hidden="true"></i>

            <h2>Tu carrito está vacío</h2>

            <p>Explora los negocios y agrega productos para comenzar una compra.</p>

            <Link href="/">Explorar negocios</Link>
          </section>
        ) : (
          <div className={styles.layout}>
            <section className={styles.products}>
              <div className={styles.business}>
                <div className={styles.businessLogo}>
                  {business?.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={business.logoUrl} alt={business.name} />
                  ) : (
                    <i className="bi bi-shop" aria-hidden="true"></i>
                  )}
                </div>

                <div>
                  <span>Pedido para</span>

                  <strong>{business ? business.name : "Cargando negocio..."}</strong>
                </div>

                {business?.active && <Link href={catalogHref}>Seguir comprando</Link>}
              </div>

              <div className={styles.items}>
                {items.map((item) => (
                  <article className={styles.item} key={item.id}>
                    <div className={styles.image}>
                      {item.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.imageUrl} alt={item.name} />
                      ) : (
                        <i className="bi bi-image" aria-hidden="true"></i>
                      )}
                    </div>

                    <div className={styles.info}>
                      <h2>{item.name}</h2>

                      <span>{formatMoney(item.price)} c/u</span>

                      <button type="button" onClick={() => removeItem(item.id)}>
                        Eliminar
                      </button>
                    </div>

                    <div className={styles.controls}>
                      <div className={styles.quantity}>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          −
                        </button>

                        <strong>{item.quantity}</strong>

                        <button
                          type="button"
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

              <button className={styles.clearButton} type="button" onClick={emptyCart}>
                Vaciar carrito
              </button>
            </section>

            <aside className={styles.summary}>
              <h2>Resumen</h2>

              <div className={styles.summaryRow}>
                <span>Productos</span>

                <span>{totalItemsCount}</span>
              </div>

              <div className={styles.total}>
                <span>Subtotal</span>

                <strong>{formatMoney(subtotal)}</strong>
              </div>

              <div className={styles.payment}>
                <i className="bi bi-cash" aria-hidden="true"></i>

                <div>
                  <strong>Pago contra entrega</strong>

                  <p>Pagarás cuando recibas tu pedido.</p>
                </div>
              </div>

              {!business?.active && businessResult?.businessId === businessId && (
                <p className={styles.error} role="alert">
                  Este negocio ya no está disponible.
                </p>
              )}

              <button
                className={styles.checkoutButton}
                type="button"
                disabled={!canCheckout}
                onClick={() => router.push("/checkout")}
              >
                Continuar
              </button>

              <Link className={styles.continueLink} href={catalogHref}>
                Seguir comprando
              </Link>
            </aside>
          </div>
        )}
      </div>
    </CustomerShell>
  );
}
