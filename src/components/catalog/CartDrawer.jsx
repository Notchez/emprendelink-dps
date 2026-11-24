"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { useCart } from "@/hooks/useCart";

import styles from "./CartDrawer.module.css";

function formatMoney(value) {
  return new Intl.NumberFormat("es-SV", {
    style: "currency",
    currency: "USD",
  }).format(Number(value) || 0);
}

export default function CartDrawer({ isOpen, onClose, businessName }) {
  const router = useRouter();

  const { items, subtotal, updateQuantity, removeItem } = useCart();

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className={styles.overlay}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <aside
        className={styles.drawer}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
      >
        <header className={styles.header}>
          <div>
            <h2 id="cart-drawer-title">Tu carrito</h2>

            {businessName && <p>{businessName}</p>}
          </div>

          <button
            className={styles.closeButton}
            type="button"
            onClick={onClose}
            aria-label="Cerrar carrito"
          >
            <i className="bi bi-x-lg" aria-hidden="true"></i>
          </button>
        </header>

        <div className={styles.items}>
          {items.length === 0 ? (
            <div className={styles.empty}>
              <i className="bi bi-cart3" aria-hidden="true"></i>

              <p>Tu carrito está vacío.</p>
            </div>
          ) : (
            items.map((item) => (
              <article className={styles.item} key={item.id}>
                <div className={styles.itemImage}>
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.imageUrl} alt={item.name} />
                  ) : (
                    <i className="bi bi-image" aria-hidden="true"></i>
                  )}
                </div>

                <div className={styles.itemInfo}>
                  <strong>{item.name}</strong>

                  <span>{formatMoney(item.price)}</span>

                  <button type="button" onClick={() => removeItem(item.id)}>
                    Eliminar
                  </button>
                </div>

                <div className={styles.quantity}>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    aria-label={`Restar ${item.name}`}
                  >
                    −
                  </button>

                  <span>{item.quantity}</span>

                  <button
                    type="button"
                    disabled={item.quantity >= 999}
                    onClick={() => updateQuantity(item.id, Math.min(999, item.quantity + 1))}
                    aria-label={`Agregar ${item.name}`}
                  >
                    +
                  </button>
                </div>
              </article>
            ))
          )}
        </div>

        {items.length > 0 && (
          <footer className={styles.footer}>
            <div className={styles.subtotal}>
              <span>Subtotal</span>

              <strong>{formatMoney(subtotal)}</strong>
            </div>

            <Link className={styles.viewCartButton} href="/carrito" onClick={onClose}>
              Ver carrito
            </Link>

            <button
              className={styles.checkoutButton}
              type="button"
              onClick={() => {
                onClose();
                router.push("/checkout");
              }}
            >
              Continuar al checkout
            </button>
          </footer>
        )}
      </aside>
    </div>
  );
}
