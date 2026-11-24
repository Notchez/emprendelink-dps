"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { adminService } from "@/services/adminService";
import { filterBusinessesBySearch } from "@/utils/businessSearch";
import AdminDashboard from "./AdminDashboard";

import styles from "./AdminOverview.module.css";

function formatPercentage(value) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "No disponible";
  }

  return `${new Intl.NumberFormat("es-SV", {
    maximumFractionDigits: 2,
  }).format(value * 100)} %`;
}

export default function AdminOverview({ view = "dashboard" }) {
  const [data, setData] = useState(null);
  const [selectedPlans, setSelectedPlans] = useState({});

  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [businessSearch, setBusinessSearch] = useState("");

  const visibleBusinesses = filterBusinessesBySearch(data?.businesses ?? [], businessSearch);

  async function loadOverview() {
    setLoading(true);
    setError("");

    try {
      const overview = await adminService.getOverview();

      setData(overview);

      setSelectedPlans(
        Object.fromEntries(
          overview.businesses.map((business) => [business.id, business.planId || ""])
        )
      );
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "No se pudo cargar el panel.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;

    async function initialize() {
      try {
        const overview = await adminService.getOverview();

        if (!active) return;

        setData(overview);

        setSelectedPlans(
          Object.fromEntries(
            overview.businesses.map((business) => [business.id, business.planId || ""])
          )
        );
      } catch (caughtError) {
        if (active) {
          setError(
            caughtError instanceof Error ? caughtError.message : "No se pudo cargar el panel."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void initialize();

    return () => {
      active = false;
    };
  }, []);

  async function toggleBusiness(business) {
    setBusyId(business.id);
    setError("");
    setFeedback("");

    try {
      await adminService.setBusinessActive(business.id, !business.active);

      await loadOverview();

      setFeedback(
        business.active
          ? `Se ocultó el catálogo de ${business.name}.`
          : `Se publicó el catálogo de ${business.name}.`
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : "No se pudo actualizar el negocio."
      );
    } finally {
      setBusyId(null);
    }
  }

  async function changeBusinessPlan(business) {
    const planId = selectedPlans[business.id] || "";

    if (!planId || planId === business.planId) {
      return;
    }

    const selectedPlan = data.plans.find((plan) => plan.id === planId);

    if (!selectedPlan) {
      setError("Selecciona un plan válido.");
      return;
    }

    const confirmed = window.confirm(
      `¿Cambiar el plan de ${business.name} ` +
        `de ${business.planName} a ${selectedPlan.name}?\n\n` +
        "El nuevo plan se aplicará a los próximos pedidos. " +
        "Los pedidos y comisiones ya registrados no se modificarán."
    );

    if (!confirmed) {
      return;
    }

    setBusyId(business.id);
    setError("");
    setFeedback("");

    try {
      await adminService.changeBusinessPlan(business.id, planId);

      await loadOverview();

      setFeedback(
        `El emprendimiento ${business.name} ahora tiene ` + `el plan ${selectedPlan.name}.`
      );
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "No se pudo cambiar el plan.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.heading}>
        <div>
          <p className="eyebrow">Panel del administrador</p>

          <h1>{view === "businesses" ? "Emprendimientos registrados" : "Panel administrativo"}</h1>

          <p>{view === "businesses"
            ? "Gestiona la publicación y los planes de cada negocio desde un solo lugar."
            : "Supervisa las comisiones del mes y el estado general de EmprendeLink."}</p>
        </div>

        <button
          type="button"
          className={styles.refreshButton}
          onClick={() => void loadOverview()}
          disabled={loading || Boolean(busyId)}
        >
          {loading ? "Actualizando..." : "Actualizar datos"}
        </button>
      </div>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      {feedback && (
        <p className={styles.success} role="status">
          {feedback}
        </p>
      )}

      {loading && !data && <p role="status">Cargando indicadores...</p>}

      {data && view === "dashboard" && (
        <AdminDashboard kpis={data.kpis} commissionInsights={data.commissionInsights} />
      )}

      {view === "dashboard" && <section className={styles.actions} aria-labelledby="admin-actions-title">
        <h2 id="admin-actions-title">Gestión rápida</h2>

        <div className={styles.actionGrid}>
          <Link className={styles.actionCard} href="/admin/planes">
            <strong>Gestionar planes</strong>

            <span>Crear, editar y activar planes.</span>
          </Link>

          <Link className={styles.actionCard} href="/admin/compradores">
            <strong>Gestionar compradores</strong>

            <span>Consultar clientes y administrar su acceso.</span>
          </Link>

          <Link className={styles.actionCard} href="/admin/emprendimientos">
            <strong>Gestionar emprendimientos</strong>

            <span>Consultar negocios, cambiar sus planes y publicación.</span>
          </Link>

          <Link className={styles.actionCard} href="/orders">
            <strong>Revisar pedidos</strong>

            <span>Consultar pedidos y sus estados.</span>
          </Link>
        </div>
      </section>}

      {view === "businesses" && <section className={styles.businesses} aria-labelledby="businesses-title">
        <div className={styles.sectionHeading}>
          <div>
            <h2 id="businesses-title">Emprendimientos registrados</h2>

            <p>
              Consulta cada emprendimiento, cambia su plan y administra la publicación de su
              catálogo.
            </p>
          </div>
        </div>

        <div className={styles.businessSearch}>
          <label htmlFor="admin-business-search">Buscar emprendimiento</label>
          <div className={styles.businessSearchField}>
            <i className="bi bi-search" aria-hidden="true" />
            <input
              id="admin-business-search"
              type="search"
              autoComplete="off"
              placeholder="Nombre del negocio, propietario, correo o catálogo"
              value={businessSearch}
              onChange={(event) => setBusinessSearch(event.target.value)}
            />
          </div>
          <p role="status" className={styles.businessSearchCount}>
            {loading && !data
              ? "Buscando emprendimientos..."
              : `Mostrando ${visibleBusinesses.length} de ${data?.businesses.length ?? 0} emprendimientos`}
          </p>
        </div>

        {!loading && data?.businesses.length === 0 && (
          <p>Aún no hay emprendimientos registrados.</p>
        )}

        {!loading && Boolean(data?.businesses.length) && visibleBusinesses.length === 0 && (
          <p role="status">No encontramos emprendimientos que coincidan con la búsqueda.</p>
        )}

        <div className={styles.businessGrid}>
          {visibleBusinesses.map((business) => {
            const selectedPlanId = selectedPlans[business.id] || "";

            const hasPlanChange = selectedPlanId !== business.planId;

            return (
              <article className={styles.businessCard} key={business.id}>
                <div className={styles.businessInfo}>
                  <h3><Link href={`/admin/emprendimientos/${encodeURIComponent(business.id)}`}>{business.name}</Link></h3>

                  <p>
                    <strong>Propietario:</strong> {business.ownerName}
                  </p>

                  {business.ownerEmail && (
                    <p>
                      <strong>Correo:</strong> {business.ownerEmail}
                    </p>
                  )}

                  <p>
                    <strong>Plan actual:</strong> {business.planName}
                  </p>

                  <p>
                    <strong>Tasa actual:</strong> {formatPercentage(business.planCommissionRate)}
                  </p>

                  <p>
                    <strong>Productos activos:</strong> {business.activeProductsCount}
                    {business.planMaxActiveProducts !== null
                      ? ` de ${business.planMaxActiveProducts}`
                      : ""}
                  </p>

                  <p>
                    <strong>Catálogo:</strong>{" "}
                    <Link href={`/catalogo/${encodeURIComponent(business.slug)}`}>
                      /catalogo/{business.slug}
                    </Link>
                  </p>

                  <span className={business.active ? styles.active : styles.inactive}>
                    {business.active ? "Publicado" : "Oculto"}
                  </span>
                </div>

                <div className={styles.businessControls}>
                  <Link className={styles.detailLink} href={`/admin/emprendimientos/${encodeURIComponent(business.id)}`}>
                    <i className="bi bi-graph-up-arrow" aria-hidden="true" /> Ver desempeño
                  </Link>
                  <label htmlFor={`plan-${business.id}`}>Cambiar plan</label>

                  <select
                    id={`plan-${business.id}`}
                    value={selectedPlanId}
                    onChange={(event) => {
                      setSelectedPlans((previous) => ({
                        ...previous,
                        [business.id]: event.target.value,
                      }));
                    }}
                    disabled={Boolean(busyId) || loading}
                  >
                    {!data.plans.some((plan) => plan.id === business.planId) && (
                      <option value={business.planId}>Plan actual no disponible</option>
                    )}

                    {data.plans
                      .filter((plan) => plan.active || plan.id === business.planId)
                      .map((plan) => (
                        <option key={plan.id} value={plan.id}>
                          {plan.name} — {formatPercentage(plan.commissionRate)}
                          {!plan.active ? " (inactivo)" : ""}
                        </option>
                      ))}
                  </select>

                  <button
                    type="button"
                    className={styles.primaryButton}
                    onClick={() => void changeBusinessPlan(business)}
                    disabled={Boolean(busyId) || loading || !hasPlanChange}
                  >
                    {busyId === business.id ? "Guardando..." : "Guardar plan"}
                  </button>

                  <button
                    type="button"
                    className={styles.refreshButton}
                    onClick={() => void toggleBusiness(business)}
                    disabled={Boolean(busyId) || loading}
                  >
                    {business.active ? "Ocultar catálogo" : "Publicar catálogo"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>}
    </div>
  );
}
