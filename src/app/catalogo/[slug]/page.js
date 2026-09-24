"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { AccountActions } from "@/components/auth/AccountActions";
import { catalogService } from "@/services/catalogService";
import { useCart } from "@/hooks/useCart";

import styles from "./Catalog.module.css";

function formatMoney(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value || 0));
}

function ProductImage({ product, className }) {
  if (!product.imageUrl) {
    return (
      <div className={`${className} ${styles.imagePlaceholder}`}>
        <span>Sin imagen disponible</span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img className={className} src={product.imageUrl} alt={product.name} loading="lazy" />
  );
}

function ProductCard({ product, onSelectDetail, onAddToCart }) {
  return (
    <article className={styles.productCard}>
      <ProductImage product={product} className={styles.productImage} />

      <div className={styles.productContent}>
        <div>
          <h3>{product.name}</h3>

          <p className={styles.description}>
            {product.description || "Sin descripción disponible."}
          </p>
        </div>

        <div className={styles.productFooter}>
          <strong className={styles.price}>{formatMoney(product.price)}</strong>

          <div className={styles.productActions}>
            <button
              className={styles.secondaryButton}
              type="button"
              onClick={() => onSelectDetail(product)}
            >
              Ver detalle
            </button>

            <button
              className={styles.primaryButton}
              type="button"
              onClick={() => onAddToCart(product)}
            >
              Agregar
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function ProductDetailModal({ product, onClose, onAddToCart }) {
  const [quantity, setQuantity] = useState(1);

  function handleAdd() {
    const added = onAddToCart(product, quantity);

    if (added !== false) {
      onClose();
    }
  }

  return (
    <div className={styles.overlay}>
      <section
        className={styles.productModal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-detail-title"
      >
        <div className={styles.modalHeader}>
          <h2 id="product-detail-title">{product.name}</h2>

          <button
            className={styles.iconButton}
            type="button"
            onClick={onClose}
            aria-label="Cerrar detalle"
          >
            ✕
          </button>
        </div>

        <ProductImage product={product} className={styles.modalImage} />

        <p className={styles.description}>{product.description || "Sin descripción disponible."}</p>

        <p className={styles.modalPrice}>{formatMoney(product.price)}</p>

        <label className={styles.quantityField} htmlFor="product-quantity">
          Cantidad
          <input
            id="product-quantity"
            type="number"
            min="1"
            max="999"
            value={quantity}
            onChange={(event) => {
              const nextValue = Number(event.target.value);

              setQuantity(
                Number.isFinite(nextValue) ? Math.max(1, Math.min(999, Math.trunc(nextValue))) : 1
              );
            }}
          />
        </label>

        <div className={styles.modalActions}>
          <button className={styles.secondaryButton} type="button" onClick={onClose}>
            Cerrar
          </button>

          <button className={styles.primaryButton} type="button" onClick={handleAdd}>
            Agregar al carrito
          </button>
        </div>
      </section>
    </div>
  );
}

function CartDrawer({ onClose }) {
  const router = useRouter();

  const { items, subtotal, updateQuantity, removeItem, clearCart } = useCart();

  return (
    <div className={styles.overlay}>
      <aside
        className={styles.cartDrawer}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
      >
        <div className={styles.drawerHeader}>
          <h2 id="cart-title">Tu carrito</h2>

          <button
            className={styles.iconButton}
            type="button"
            onClick={onClose}
            aria-label="Cerrar carrito"
          >
            ✕
          </button>
        </div>

        <div className={styles.cartItems}>
          {items.length === 0 ? (
            <p className={styles.emptyMessage}>Tu carrito está vacío.</p>
          ) : (
            items.map((item) => (
              <article className={styles.cartItem} key={item.id}>
                <div>
                  <strong>{item.name}</strong>

                  <p>{formatMoney(item.price)} por unidad</p>
                </div>

                <div className={styles.cartControls}>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    aria-label={`Quitar una unidad de ${item.name}`}
                  >
                    −
                  </button>

                  <span>{item.quantity}</span>

                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, Math.min(999, item.quantity + 1))}
                    aria-label={`Agregar una unidad de ${item.name}`}
                  >
                    +
                  </button>

                  <button
                    type="button"
                    className={styles.removeButton}
                    onClick={() => removeItem(item.id)}
                    aria-label={`Eliminar ${item.name} del carrito`}
                  >
                    ✕
                  </button>
                </div>
              </article>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className={styles.cartFooter}>
            <div className={styles.cartSubtotal}>
              <strong>Subtotal</strong>

              <strong>{formatMoney(subtotal)}</strong>
            </div>

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

            <button className={styles.clearButton} type="button" onClick={clearCart}>
              Vaciar carrito
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}

export default function CatalogPage({ params }) {
  const { slug } = use(params);

  const { addItem, totalItemsCount } = useCart();

  const [catalog, setCatalog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedCategory, setSelectedCategory] = useState("cat_all");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadCatalog() {
      try {
        const result = await catalogService.getCatalogBySlug(slug);

        if (!active) return;

        if (!result.success || !result.data) {
          setError(result.error?.message || "No se pudo cargar el catálogo.");

          setCatalog(null);
          return;
        }

        setCatalog(result.data);
        setError("");
      } catch (caughtError) {
        if (active) {
          setError(
            caughtError instanceof Error ? caughtError.message : "No se pudo cargar el catálogo."
          );

          setCatalog(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    if (slug) {
      void loadCatalog();
    }

    return () => {
      active = false;
    };
  }, [slug]);

  const business = catalog?.business;
  const categories = catalog?.categories || [];
  const products = catalog?.products || [];

  const filteredProducts = products.filter((product) => {
    if (!product.active) return false;

    const matchesCategory =
      selectedCategory === "cat_all" || product.categoryId === selectedCategory;

    const query = searchQuery.trim().toLowerCase();

    const matchesSearch =
      !query ||
      product.name.toLowerCase().includes(query) ||
      String(product.description || "")
        .toLowerCase()
        .includes(query);

    return matchesCategory && matchesSearch;
  });

  return (
    <main className={styles.catalogPage}>
      <div className={styles.container}>
        <nav className={styles.topbar} aria-label="Navegación del catálogo">
          <Link className={styles.brand} href="/">
            <strong>Emprende</strong>Link
          </Link>

          <div className={styles.topbarActions}>
            <AccountActions />

            <button className={styles.cartButton} type="button" onClick={() => setIsCartOpen(true)}>
              🛒 Carrito ({totalItemsCount})
            </button>
          </div>
        </nav>

        {loading && (
          <p className={styles.message} role="status">
            Cargando catálogo del emprendimiento...
          </p>
        )}

        {!loading && error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}

        {!loading && !error && business && (
          <>
            <header className={styles.businessHeader}>
              {business.logoUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  className={styles.businessLogo}
                  src={business.logoUrl}
                  alt={`Logotipo de ${business.name}`}
                />
              )}

              <div>
                <p className={styles.eyebrow}>Catálogo del emprendimiento</p>

                <h1>{business.name}</h1>

                <p>Explora nuestros productos disponibles.</p>
              </div>
            </header>

            <section className={styles.catalogSection} aria-label="Productos disponibles">
              <div className={styles.sectionHeading}>
                <div>
                  <h2>Productos disponibles</h2>

                  <p>
                    {filteredProducts.length}{" "}
                    {filteredProducts.length === 1
                      ? "producto encontrado"
                      : "productos encontrados"}
                  </p>
                </div>
              </div>

              <div className={styles.filters}>
                <label className={styles.searchField} htmlFor="catalog-search">
                  Buscar productos
                  <input
                    id="catalog-search"
                    type="search"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Nombre o descripción"
                  />
                </label>

                <label className={styles.categoryField} htmlFor="catalog-category">
                  Categoría
                  <select
                    id="catalog-category"
                    value={selectedCategory}
                    onChange={(event) => setSelectedCategory(event.target.value)}
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {filteredProducts.length === 0 ? (
                <p className={styles.message}>
                  No se encontraron productos disponibles con estos filtros.
                </p>
              ) : (
                <div className={styles.productGrid}>
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onSelectDetail={setSelectedProduct}
                      onAddToCart={(selected) => addItem(selected, 1)}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>

      {selectedProduct && (
        <ProductDetailModal
          key={selectedProduct.id}
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={addItem}
        />
      )}

      {isCartOpen && <CartDrawer onClose={() => setIsCartOpen(false)} />}
    </main>
  );
}
