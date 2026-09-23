"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { adminService } from "@/services/adminService";
import AdminDashboard from "./AdminDashboard";
import styles from "./AdminOverview.module.css";

export default function AdminOverview() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");

  async function loadOverview() {
    setLoading(true);
    setError("");
    try {
      setData(await adminService.getOverview());
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "No se pudo cargar el panel.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function initialize() {
      setLoading(true);
      setError("");
      try {
        const overview = await adminService.getOverview();
        if (!cancelled) setData(overview);
      } catch (caughtError) {
        if (!cancelled) {
          setError(caughtError instanceof Error ? caughtError.message : "No se pudo cargar el panel.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void initialize();
    return () => {
      cancelled = true;
    };
  }, []);

  async function toggleBusiness(business) {
    setBusyId(business.id);
    setError("");
    try {
      await adminService.setBusinessActive(business.id, !business.active);
      await loadOverview();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "No se pudo actualizar el negocio.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.heading}>
        <div>
          <p className="eyebrow">Panel del administrador</p>
          <h1>Panel administrativo</h1>
          <p>Supervisa usuarios, emprendimientos, planes y pedidos desde un solo lugar.</p>
        </div>
        <button type="button" className={styles.refreshButton} onClick={() => void loadOverview()} disabled={loading}>
          {loading ? "Actualizando..." : "Actualizar datos"}
        </button>
      </div>

      {error ? <p className={styles.error} role="alert">{error}</p> : null}
      {loading && !data ? <p role="status">Cargando indicadores...</p> : null}
      {data ? <AdminDashboard kpis={data.kpis} /> : null}

      <section className={styles.actions} aria-labelledby="admin-actions-title">
        <h2 id="admin-actions-title">Gestión rápida</h2>
        <div className={styles.actionGrid}>
          <Link className={styles.actionCard} href="/admin/planes">
            <strong>Gestionar planes</strong>
            <span>Crear, editar y activar planes para los emprendedores.</span>
          </Link>
          <Link className={styles.actionCard} href="/orders">
            <strong>Revisar pedidos</strong>
            <span>Consultar pedidos y sus estados.</span>
          </Link>
        </div>
      </section>

      <section className={styles.businesses} aria-labelledby="businesses-title">
        <div className={styles.sectionHeading}>
          <div>
            <h2 id="businesses-title">Emprendimientos registrados</h2>
            <p>Activa o desactiva la publicación de cada catálogo.</p>
          </div>
        </div>
        {!loading && data?.businesses.length === 0 ? <p>Aún no hay emprendimientos registrados.</p> : null}
        <div className={styles.businessGrid}>
          {data?.businesses.map((business) => (
            <article className={styles.businessCard} key={business.id}>
              <div>
                <h3>{business.name}</h3>
                <p>Catálogo: /catalogo/{business.slug}</p>
                <span className={business.active ? styles.active : styles.inactive}>
                  {business.active ? "Publicado" : "Oculto"}
                </span>
              </div>
              <button type="button" className={styles.refreshButton} onClick={() => void toggleBusiness(business)} disabled={busyId === business.id}>
                {busyId === business.id ? "Guardando..." : business.active ? "Ocultar" : "Publicar"}
              </button>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
