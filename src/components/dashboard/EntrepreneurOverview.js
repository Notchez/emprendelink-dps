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
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const business = await businessService.getByOwnerId(user?.id);
        if (!business) {
          if (!cancelled) setData({ business: null, categories: 0, products: 0, activeProducts: 0 });
          return;
        }

        const [categories, products] = await Promise.all([
          categoryService.getByBusinessId(business.id),
          productService.getByBusinessId(business.id),
        ]);

        if (!cancelled) {
          setData({
            business,
            categories: categories.length,
            products: products.length,
            activeProducts: products.filter((product) => product.active).length,
          });
        }
      } catch (caughtError) {
        if (!cancelled) {
          setError(caughtError instanceof Error ? caughtError.message : "No se pudo cargar tu negocio.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (user?.id) void load();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  if (loading) return <p role="status">Cargando tu emprendimiento...</p>;
  if (error) return <p role="alert">{error}</p>;

  if (!data?.business) {
    return (
      <section className={styles.emptyState}>
        <p className="eyebrow">Primer paso</p>
        <h2>Configura tu negocio</h2>
        <p>Registra el nombre, el catálogo, el logotipo y un plan para comenzar a publicar productos.</p>
        <Link className={styles.primaryButton} href="/emprendedor/negocio">
          Configurar mi negocio
        </Link>
      </section>
    );
  }

  const { business } = data;
  const catalogHref = `/catalogo/${encodeURIComponent(business.slug)}`;

  return (
    <div className={styles.wrapper}>
      <section className={styles.businessHeader}>
        {business.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={business.logoUrl} alt={`Logotipo de ${business.name}`} />
        ) : null}
        <div>
          <p className="eyebrow">Panel del emprendedor</p>
          <h1>{business.name}</h1>
          <p>Tu catálogo está disponible en <Link href={catalogHref}>{catalogHref}</Link>.</p>
        </div>
        <Link className={styles.primaryButton} href={catalogHref}>Ver catálogo</Link>
      </section>

      <section aria-labelledby="entrepreneur-summary-title">
        <h2 id="entrepreneur-summary-title">Resumen de tu negocio</h2>
        <div className={dashboardStyles.kpiGrid}>
          <KpiCard title="Categorías" value={data.categories} />
          <KpiCard title="Productos registrados" value={data.products} />
          <KpiCard title="Productos activos" value={data.activeProducts} />
        </div>
      </section>

      <section className={styles.actions} aria-labelledby="entrepreneur-actions-title">
        <h2 id="entrepreneur-actions-title">Accesos rápidos</h2>
        <div className={styles.actionGrid}>
          <Link href="/emprendedor/negocio">Configuración de tu negocio</Link>
          <Link href="/emprendedor/categorias">Gestionar categorías</Link>
          <Link href="/emprendedor/productos">Gestionar productos</Link>
          <Link href="/orders">Consultar pedidos</Link>
        </div>
      </section>
    </div>
  );
}
