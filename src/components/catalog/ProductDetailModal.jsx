"use client";

import { useState } from "react";

import styles from "./ProductDetailModal.module.css";

function formatMoney(value) {
  return new Intl.NumberFormat("es-SV", {
    style: "currency",
    currency: "USD",
  }).format(Number(value) || 0);
}

export function ProductDetailModal({ product, onClose, onAdd }) {
  const [quantity, setQuantity] = useState(1);

  function addProduct() {
    const added = onAdd(product, quantity);

    if (added !== false) {
      onClose();
    }
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
      <section
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-modal-title"
      >
        <button className={styles.closeButton} type="button" onClick={onClose} aria-label="Cerrar">
          <i className="bi bi-x-lg" aria-hidden="true"></i>
        </button>

        <div className={styles.image}>
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.imageUrl} alt={product.name} />
          ) : (
            <i className="bi bi-image" aria-hidden="true"></i>
          )}
        </div>

        <div className={styles.body}>
          <h2 id="product-modal-title">{product.name}</h2>

          <p>{product.description || "Sin descripción disponible."}</p>

          <strong className={styles.price}>{formatMoney(product.price)}</strong>

          <div className={styles.quantityRow}>
            <span>Cantidad</span>

            <div className={styles.quantity}>
              <button
                type="button"
                onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                aria-label="Restar una unidad"
              >
                −
              </button>

              <strong>{quantity}</strong>

              <button
                type="button"
                onClick={() => setQuantity((current) => Math.min(999, current + 1))}
                aria-label="Agregar una unidad"
              >
                +
              </button>
            </div>
          </div>

          <button className={styles.addButton} type="button" onClick={addProduct}>
            Agregar {quantity} al carrito
            <strong>{formatMoney(Number(product.price) * quantity)}</strong>
          </button>
        </div>
      </section>
    </div>
  );
}
