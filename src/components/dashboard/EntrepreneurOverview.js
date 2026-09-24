"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { useAuth } from "@/hooks/useAuth";
import { businessService } from "@/services/businessService";
import { categoryService } from "@/services/categoryService";
import { productService } from "@/services/productService";

import KpiCard from "./KpiCard";
import styles from "./EntrepreneurOverview.module.css";
import dashboardStyles from "./EntrepreneurDashboard.module.css";

export default function EntrepreneurOverview() {
  const { user } = useAuth();
  const userId = user?.id;

  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!userId) return;

    let active = true;

    async function loadOverview() {
      try {
        const business = await businessService.getByOwnerId(userId);

        if (!business) {
          if (active) {
            setResult({
              userId,
              business: null,
              categories: 0,
              products: 0,
              activeProducts: 0,
              error: "",
            });
          }

          return;
        }

        const [categories, products] = await Promise.all([
          categoryService.getByBusinessId(business.id),
          productService.getByBusinessId(business.id),
        ]);

        if (active) {
          setResult({
            userId,
            business,
            categories: categories.length,
            products: products.length,
            activeProducts: products.filter((product) => product.active).length,
            error: "",
          });
        }
      } catch (error) {
        if (active) {
          setResult({
            userId,
            business: null,
            error: error instanceof Error ? error.message : "No se pudo cargar tu emprendimiento.",
          });
        }
      }
    }

    void loadOverview();

    return () => {
      active = false;
    };
  }, [userId]);

  if (!userId || result?.userId !== userId) {
    return <p role="status">Cargando tu emprendimiento...</p>;
  }

  if (result.error) {
    return <p role="alert">{result.error}</p>;
  }

  if (!result.business) {
    return (
      <section className={styles.emptyState}>
        <p className="eyebrow">Primer paso</p>

        <h2>Configura tu negocio</h2>

        <p>
          Registra el nombre, el catálogo, el logotipo y un plan para comenzar a publicar productos.
        </p>

        <Link className={styles.primaryButton} href="/emprendedor/negocio">
          Configurar mi negocio
        </Link>
      </section>
    );
  }

  const { business } = result;

  const catalogHref = `/catalogo/${encodeURIComponent(business.slug)}`;

  return (
    <div className={styles.wrapper}>
      <section className={styles.businessHeader}>
        {business.logoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={business.logoUrl} alt={`Logotipo de ${business.name}`} />
        )}

        <div>
          <p className="eyebrow">Panel del emprendedor</p>

          <h1>{business.name}</h1>

          <p>
            Tu catálogo está disponible en <Link href={catalogHref}>{catalogHref}</Link>.
          </p>
        </div>

        <Link className={styles.primaryButton} href={catalogHref}>
          Ver catálogo
        </Link>
      </section>

      <section aria-labelledby="entrepreneur-summary-title">
        <h2 id="entrepreneur-summary-title">Resumen de tu negocio</h2>

        <p>Selecciona una tarjeta para acceder a su gestión.</p>

        <div className={dashboardStyles.kpiGrid}>
          <KpiCard title="Categorías" value={result.categories} href="/emprendedor/categorias" />

          <KpiCard
            title="Productos registrados"
            value={result.products}
            href="/emprendedor/productos"
          />

          <KpiCard
            title="Productos activos"
            value={result.activeProducts}
            href="/emprendedor/productos"
          />
        </div>
      </section>

      <section className={styles.actions} aria-labelledby="entrepreneur-actions-title">
        <h2 id="entrepreneur-actions-title">Accesos rápidos</h2>

        <div className={styles.actionGrid}>
          <Link href="/emprendedor/negocio">Configuración de tu negocio</Link>

          <Link href="/emprendedor/categorias">Gestionar categorías</Link>

          <Link href="/emprendedor/productos">Gestionar productos</Link>

          <Link href="/orders">Consultar pedidos</Link>

          <Link href="/emprendedor/reportes">Reportes</Link>

          <Link href="/emprendedor/estado-cuenta">Estado de cuenta</Link>
        </div>
      </section>
    </div>
  );
}
