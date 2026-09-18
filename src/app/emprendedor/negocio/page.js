"use client";

import { useState } from "react";

import { useAuth } from "@/hooks/useAuth";
import { useBusinessForm } from "@/hooks/useBusinessForm";

import styles from "./BusinessSettings.module.css";

export default function BusinessSettingsPage() {
  const { user, loading: authLoading } = useAuth();

  const {
    values,
    errors,
    business,
    plans,
    loading,
    loadError,
    saving,
    updateField,
    formatSlug,
    saveBusiness,
  } = useBusinessForm(user?.id ?? null);

  const [feedback, setFeedback] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setFeedback("");

    try {
      const savedBusiness = await saveBusiness();

      if (savedBusiness) {
        setFeedback(
          business
            ? "La información del negocio se actualizó correctamente."
            : "El negocio se creó correctamente."
        );
      }
    } catch (error) {
      setFeedback(
        error instanceof Error ? error.message : "No se pudo guardar la información del negocio."
      );
    }
  }

  if (authLoading) {
    return (
      <main className={styles.page}>
        <div className={styles.container}>
          <p className={styles.stateMessage}>Comprobando tu sesión...</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className={styles.page}>
        <div className={styles.container}>
          <h1 className={styles.title}>Configuración del negocio</h1>

          <p className={styles.stateMessage}>
            La configuración del negocio estará disponible cuando inicies sesión.
          </p>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className={styles.page}>
        <div className={styles.container}>
          <p className={styles.stateMessage}>Cargando información del negocio...</p>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>Configuración del negocio</h1>

        <p className={styles.description}>Administra la información de tu emprendimiento.</p>

        {loadError ? (
          <p className={styles.errorMessage} role="alert">
            {loadError}
          </p>
        ) : null}

        <section className={styles.card} aria-labelledby="business-info-title">
          <h2 id="business-info-title" className={styles.sectionTitle}>
            Información general
          </h2>

          <p className={styles.sectionDescription}>
            Personaliza los datos que identifican a tu negocio.
          </p>

          <form className={styles.fields} onSubmit={handleSubmit} noValidate>
            <div className={styles.field}>
              <label htmlFor="business-name" className={styles.label}>
                Nombre del emprendimiento
              </label>

              <input
                id="business-name"
                name="name"
                type="text"
                className={styles.input}
                placeholder="Ej. Artesanías Luna"
                value={values.name}
                onChange={(event) => updateField("name", event.target.value)}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? "name-error" : undefined}
                disabled={saving || Boolean(loadError)}
                required
              />

              {errors.name ? (
                <p id="name-error" className={styles.error} role="alert">
                  {errors.name}
                </p>
              ) : null}
            </div>

            <div className={styles.field}>
              <label htmlFor="business-slug" className={styles.label}>
                Dirección de tu catálogo
              </label>

              <input
                id="business-slug"
                name="slug"
                type="text"
                className={styles.input}
                placeholder="Ej. Artesanías Luna"
                value={values.slug}
                onChange={(event) => updateField("slug", event.target.value)}
                onBlur={formatSlug}
                aria-invalid={Boolean(errors.slug)}
                aria-describedby={errors.slug ? "slug-help slug-error" : "slug-help"}
                disabled={saving || Boolean(loadError)}
                required
              />

              <p id="slug-help" className={styles.help}>
                Tus clientes usarán esta dirección para visitar tu catálogo. Puedes escribir con
                espacios y tildes; nosotros adaptamos el texto.
              </p>

              {errors.slug ? (
                <p id="slug-error" className={styles.error} role="alert">
                  {errors.slug}
                </p>
              ) : null}
            </div>

            <div className={styles.field}>
              <label htmlFor="business-plan" className={styles.label}>
                Plan
              </label>

              <select
                id="business-plan"
                name="planId"
                className={styles.input}
                value={values.planId}
                onChange={(event) => updateField("planId", event.target.value)}
                aria-invalid={Boolean(errors.planId)}
                aria-describedby={errors.planId ? "plan-help plan-error" : "plan-help"}
                disabled={saving || Boolean(business) || Boolean(loadError)}
                required
              >
                <option value="">Selecciona un plan</option>

                {plans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} — hasta {plan.maxActiveProducts} productos activos
                  </option>
                ))}
              </select>

              <p id="plan-help" className={styles.help}>
                {business
                  ? "El cambio de plan se administra desde el módulo de planes."
                  : "El plan determina cuántos productos puedes mantener activos."}
              </p>

              {errors.planId ? (
                <p id="plan-error" className={styles.error} role="alert">
                  {errors.planId}
                </p>
              ) : null}

              {!business && plans.length === 0 && !loadError ? (
                <p className={styles.warning} role="status">
                  Todavía no hay planes activos disponibles. No podrás crear el negocio hasta que el
                  módulo de planes registre uno.
                </p>
              ) : null}
            </div>

            <div className={styles.actions}>
              <button
                type="submit"
                className={styles.primaryButton}
                disabled={saving || Boolean(loadError) || (!business && plans.length === 0)}
              >
                {saving ? "Guardando..." : business ? "Guardar cambios" : "Crear negocio"}
              </button>
            </div>
          </form>

          {feedback ? (
            <p
              className={feedback.includes("correctamente") ? styles.success : styles.errorMessage}
              role="status"
            >
              {feedback}
            </p>
          ) : null}
        </section>
      </div>
    </main>
  );
}
