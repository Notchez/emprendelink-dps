"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { useAuth } from "@/hooks/useAuth";
import { businessService } from "@/services/businessService";
import { categoryService } from "@/services/categoryService";
import { productService } from "@/services/productService";
import { orderService } from "@/services/orderService";
import { getActiveOrders } from "@/utils/entrepreneurReports";
import { formatOrderDate, formatOrderMoney } from "@/utils/orderUtils";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";

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
              activeOrders: [],
              error: "",
            });
          }

          return;
        }

        const [categories, products, orders] = await Promise.all([
          categoryService.getByBusinessId(business.id),
          productService.getByBusinessId(business.id),
          orderService.getOrders({ businessId: business.id }),
        ]);

        if (active) {
          setResult({
            userId,
            business,
            categories: categories.length,
            products: products.length,
            activeProducts: products.filter((product) => product.active).length,
            activeOrders: getActiveOrders(orders),
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

      <section className={styles.ordersSection} aria-labelledby="entrepreneur-active-orders-title">
        <div className={styles.sectionHeading}>
          <div>
            <p className="eyebrow">Prioridad de hoy</p>
            <h2 id="entrepreneur-active-orders-title">Pedidos activos</h2>
            <p>Pedidos recibidos que aún no se entregaron ni cancelaron.</p>
          </div>
          <Link className={styles.primaryButton} href="/orders">Ver todos los pedidos</Link>
        </div>

        {result.activeOrders.length === 0 ? (
          <p className={styles.emptyOrders}>No tienes pedidos activos por atender.</p>
        ) : (
          <div className={styles.ordersGrid}>
            {result.activeOrders.slice(0, 6).map((order) => (
              <article className={styles.orderCard} key={order.id}>
                <div className={styles.orderTop}>
                  <strong title={order.id}>PED-{String(order.id).slice(0, 8).toUpperCase()}</strong>
                  <OrderStatusBadge status={order.status} />
                </div>
                <p><strong>{order.customer?.name || "Cliente no disponible"}</strong></p>
                <p className={styles.orderMuted}>{formatOrderDate(order.createdAt)}</p>
                <p>{(order.items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0)} productos · <strong>{formatOrderMoney(order.subtotal)}</strong></p>
                <Link href={`/orders/${encodeURIComponent(order.id)}`}>Ver detalles del pedido →</Link>
              </article>
            ))}
          </div>
        )}
        {result.activeOrders.length > 6 && <p className={styles.orderMuted}>Mostrando 6 de {result.activeOrders.length} pedidos activos.</p>}
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

          <Link href="/emprendedor/reportes">Ventas</Link>

          <Link href="/emprendedor/estado-cuenta">Comisiones</Link>
        </div>
      </section>
    </div>
  );
}
