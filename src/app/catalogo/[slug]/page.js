"use client";

import { use, useEffect, useMemo, useState } from "react";

import Link from "next/link";

import { CustomerShell } from "@/components/customer/CustomerShell";

import { ProductCard } from "@/components/catalog/ProductCard";
import { ProductDetailModal } from "@/components/catalog/ProductDetailModal";
import CartDrawer from "@/components/catalog/CartDrawer";

import { catalogService } from "@/services/catalogService";

import { useCart } from "@/hooks/useCart";

import styles from "./Catalog.module.css";

export default function CatalogPage({ params }) {
  const { slug } = use(params);

  const { addItem, totalItemsCount } = useCart();

  const [catalog, setCatalog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("cat_all");

  const [selectedProduct, setSelectedProduct] = useState(null);

  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    let active = true;

    catalogService
      .getCatalogBySlug(slug)
      .then((result) => {
        if (!active) return;

        if (!result.success || !result.data) {
          setCatalog(null);
          setError(result.error?.message || "No se pudo cargar el catálogo.");

          return;
        }

        setCatalog(result.data);
        setError("");
      })
      .catch((failure) => {
        if (!active) return;

        setCatalog(null);

        setError(failure instanceof Error ? failure.message : "No se pudo cargar el catálogo.");
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [slug]);

  const business = catalog?.business;
  const categories = catalog?.categories || [];
  const products = catalog?.products || [];

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === "cat_all" || product.categoryId === selectedCategory;

      const matchesSearch =
        !query ||
        String(product.name || "")
          .toLowerCase()
          .includes(query) ||
        String(product.description || "")
          .toLowerCase()
          .includes(query);

      return product.active && matchesCategory && matchesSearch;
    });
  }, [products, search, selectedCategory]);

  function addProduct(product, quantity = 1) {
    return addItem(
      {
        id: product.id,
        businessId: product.businessId,
        name: product.name,
        description: product.description || "",
        price: product.price,
        imageUrl: product.imageUrl || null,
      },
      quantity
    );
  }

  if (loading) {
    return (
      <CustomerShell>
        <div className={styles.message}>Cargando catálogo...</div>
      </CustomerShell>
    );
  }

  if (error || !business) {
    return (
      <CustomerShell>
        <div className={styles.error}>
          <h1>Catálogo no disponible</h1>

          <p>{error || "No pudimos encontrar este negocio."}</p>

          <Link href="/">Volver a negocios</Link>
        </div>
      </CustomerShell>
    );
  }

  return (
    <CustomerShell>
      <div className={styles.page}>
        <Link className={styles.backLink} href="/">
          <i className="bi bi-chevron-left" aria-hidden="true"></i>
          Negocios
        </Link>

        <header className={styles.businessHeader}>
          <div className={styles.businessLogo}>
            {business.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={business.logoUrl} alt={`Logotipo de ${business.name}`} />
            ) : (
              <i className="bi bi-shop" aria-hidden="true"></i>
            )}
          </div>

          <div className={styles.businessInfo}>
            <p className={styles.eyebrow}>EMPRENDIMIENTO</p>

            <h1>{business.name}</h1>

            <p>Explora los productos disponibles.</p>
          </div>

          <button className={styles.cartButton} type="button" onClick={() => setCartOpen(true)}>
            <i className="bi bi-cart3" aria-hidden="true"></i>

            <span>Carrito</span>

            {totalItemsCount > 0 && <strong>{totalItemsCount}</strong>}
          </button>
        </header>

        <label className={styles.searchBox}>
          <i className="bi bi-search" aria-hidden="true"></i>

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar productos..."
            aria-label="Buscar productos"
          />
        </label>

        {categories.length > 0 && (
          <div className={styles.categories} aria-label="Categorías">
            {categories.map((category) => (
              <button
                className={selectedCategory === category.id ? styles.activeCategory : ""}
                type="button"
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
              >
                {category.name}
              </button>
            ))}
          </div>
        )}

        <section className={styles.productsSection}>
          <div className={styles.sectionHeading}>
            <h2>Productos</h2>

            <span>
              {filteredProducts.length} {filteredProducts.length === 1 ? "producto" : "productos"}
            </span>
          </div>

          {filteredProducts.length === 0 ? (
            <div className={styles.empty}>
              <i className="bi bi-search" aria-hidden="true"></i>

              <p>No encontramos productos con estos filtros.</p>
            </div>
          ) : (
            <div className={styles.productsGrid}>
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onOpen={setSelectedProduct}
                  onAdd={addProduct}
                />
              ))}
            </div>
          )}
        </section>

        {selectedProduct && (
          <ProductDetailModal
            key={selectedProduct.id}
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onAdd={addProduct}
          />
        )}

        <CartDrawer
          isOpen={cartOpen}
          onClose={() => setCartOpen(false)}
          businessName={business.name}
        />
      </div>
    </CustomerShell>
  );
}
