"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/hooks/useCart";

import { AccountActions } from "@/components/auth/AccountActions";
import { ROLES } from "@/lib/constants/roles";
import { businessService } from "@/services/businessService";

import styles from "./Home.module.css";

export default function HomePage() {
  const { user, identity } = useAuth();
  const { totalItemsCount } = useCart();

  const [result, setResult] = useState(null);
  const [search, setSearch] = useState("");

  const isCustomer = user?.role === ROLES.CUSTOMER;

  useEffect(() => {
    let active = true;

    businessService
      .getPublic()
      .then((businesses) => {
        if (active) {
          setResult({
            businesses,
            error: "",
          });
        }
      })
      .catch((error) => {
        if (active) {
          setResult({
            businesses: [],
            error: error instanceof Error ? error.message : "No se pudieron cargar los negocios.",
          });
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const businesses = result?.businesses || [];

  const filteredBusinesses = businesses
    .filter((business) =>
      String(business.name || "")
        .toLowerCase()
        .includes(search.trim().toLowerCase())
    )
    .sort((a, b) => String(a.name || "").localeCompare(String(b.name || ""), "es"));

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.topbar}>
          <Link className={styles.brand} href="/">
            <strong>Emprende</strong>Link
          </Link>

          <nav className={styles.navigation} aria-label="Navegación principal">
            {isCustomer && (
              <>
                <Link href="/cliente">Mi cuenta</Link>

                <Link className={styles.cartLink} href="/cliente/carrito">
                  Mi carrito ({totalItemsCount})
                </Link>
              </>
            )}

            {!identity && <Link href="/registro">Crear cuenta</Link>}

            <AccountActions />
          </nav>
        </header>

        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <p className={styles.eyebrow}>Bienvenido a EmprendeLink</p>

            <h1>Descubre y apoya los emprendimientos de nuestra comunidad</h1>

            <p className={styles.heroDescription}>
              Explora negocios, encuentra sus productos y realiza tus pedidos directamente desde sus
              catálogos.
            </p>

            <div className={styles.heroActions}>
              <a className={styles.primaryButton} href="#negocios">
                Explorar negocios
              </a>

              {isCustomer && (
                <Link className={styles.secondaryButton} href="/cliente/carrito">
                  Revisar mi compra
                </Link>
              )}
            </div>

            <p className={styles.paymentNote}>
              <span aria-hidden="true">✓</span> Pago contra entrega
            </p>
          </div>

          <div className={styles.heroVisual}>
            <div className={styles.heroVisualIcon}>
              <span aria-hidden="true">🛍️</span>
            </div>

            <strong>Compra a emprendedores</strong>

            <p>Encuentra distintos productos en un solo lugar.</p>
          </div>
        </section>

        <section
          className={styles.businessSection}
          id="negocios"
          aria-labelledby="businesses-title"
        >
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.eyebrow}>Nuestros emprendimientos</p>

              <h2 id="businesses-title">Negocios disponibles</h2>

              <p>Selecciona un negocio para conocer sus productos.</p>
            </div>

            {result && !result.error && (
              <span className={styles.businessCount}>
                {filteredBusinesses.length}{" "}
                {filteredBusinesses.length === 1 ? "negocio" : "negocios"}
              </span>
            )}
          </div>

          <label className={styles.searchField} htmlFor="business-search">
            Buscar emprendimientos
            <input
              id="business-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Busca un negocio por su nombre..."
            />
          </label>

          {!result && (
            <p className={styles.message} role="status">
              Cargando emprendimientos...
            </p>
          )}

          {result?.error && (
            <p className={styles.error} role="alert">
              {result.error}
            </p>
          )}

          {result && !result.error && businesses.length === 0 && (
            <p className={styles.message}>
              Todavía no hay negocios publicados. Vuelve a visitarnos pronto.
            </p>
          )}

          {result && !result.error && businesses.length > 0 && filteredBusinesses.length === 0 && (
            <p className={styles.message}>No encontramos emprendimientos con ese nombre.</p>
          )}

          {filteredBusinesses.length > 0 && (
            <div className={styles.businessGrid}>
              {filteredBusinesses.map((business) => {
                const catalogHref = `/catalogo/${encodeURIComponent(business.slug)}`;

                return (
                  <article className={styles.businessCard} key={business.id}>
                    <div className={styles.businessVisual}>
                      {business.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={business.logoUrl}
                          alt={`Logotipo de ${business.name}`}
                          loading="lazy"
                        />
                      ) : (
                        <span className={styles.logoPlaceholder} aria-hidden="true">
                          🏪
                        </span>
                      )}
                    </div>

                    <div className={styles.businessContent}>
                      <span className={styles.availableBadge}>Catálogo disponible</span>

                      <h3>{business.name}</h3>

                      <p>Conoce los productos de este emprendimiento y elige tus favoritos.</p>

                      <Link className={styles.catalogButton} href={catalogHref}>
                        Explorar catálogo
                        <span aria-hidden="true">→</span>
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <footer className={styles.footer}>
          <strong>EmprendeLink</strong>

          <span>Descubre negocios y compra con pago contra entrega.</span>
        </footer>
      </div>
    </main>
  );
}
