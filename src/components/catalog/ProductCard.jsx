"use client";

import styles from "./ProductCard.module.css";

function formatMoney(value) {
  return new Intl.NumberFormat("es-SV", {
    style: "currency",
    currency: "USD",
  }).format(Number(value) || 0);
}

export function ProductCard({ product, onOpen, onAdd }) {
  return (
    <article className={styles.card}>
      <button
        className={styles.productButton}
        type="button"
        onClick={() => onOpen(product)}
        aria-label={`Ver ${product.name}`}
      >
        <div className={styles.content}>
          <h3>{product.name}</h3>

          <p>{product.description || "Sin descripción disponible."}</p>

          <strong>{formatMoney(product.price)}</strong>
        </div>

        <div className={styles.imageContainer}>
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.imageUrl} alt={product.name} loading="lazy" />
          ) : (
            <i className="bi bi-image" aria-hidden="true"></i>
          )}
        </div>
      </button>

      <button
        className={styles.addButton}
        type="button"
        onClick={() => onAdd(product, 1)}
        aria-label={`Agregar ${product.name} al carrito`}
      >
        <i className="bi bi-plus-lg" aria-hidden="true"></i>
      </button>
    </article>
  );
}
