"use client";

import { useState } from "react";
import styles from "./BusinessSettings.module.css";
import { useBusinessForm } from "@/hooks/useBusinessForm";

export default function BusinessSettingsPage() {
  const { values, errors, updateField, formatSlug, validateForm } = useBusinessForm();

  const [feedback, setFeedback] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    const isValid = validateForm();

    setFeedback(isValid ? "Los datos son válidos. Ya puedes guardarlos." : "");
  }

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>Configuración del negocio</h1>

        <p className={styles.description}>Administra la información de tu emprendimiento.</p>

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
                required
              />

              {errors.name && (
                <p id="name-error" className={styles.error} role="alert">
                  {errors.name}
                </p>
              )}
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
                required
              />

              <p id="slug-help" className={styles.help}>
                Tus clientes usarán esta dirección para visitar tu catálogo. Puedes escribir con
                espacios y tildes; nosotros adaptamos el texto.
              </p>

              {errors.slug && (
                <p id="slug-error" className={styles.error} role="alert">
                  {errors.slug}
                </p>
              )}
            </div>

            <div className={styles.actions}>
              <button type="submit" className={styles.primaryButton}>
                Revisar datos
              </button>
            </div>
          </form>

          {feedback && (
            <p className={styles.success} role="status">
              {feedback}
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
