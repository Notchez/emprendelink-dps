import styles from "./BusinessSettings.module.css";

export default function BusinessSettingsPage() {
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
          <div className={styles.fields}>
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
                required
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="business-slug" className={styles.label}>
                Identificador del catálogo (slug)
              </label>
              <input
                id="business-slug"
                name="slug"
                type="text"
                className={styles.input}
                placeholder="Ej. artesanias-luna"
                aria-describedby="slug-help"
                required
              />
              <p id="slug-help" className={styles.help}>
                Identifica tu negocio en la dirección de tu catálogo público.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
