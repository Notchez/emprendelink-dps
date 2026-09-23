"use client";

import { useAuth } from "@/hooks/useAuth";
import { useCategories } from "@/hooks/useCategories";
import styles from "./Categories.module.css";

export default function CategoriesPage() {
  const { user, loading: authLoading } = useAuth();

  const {
    businessId,
    categories,
    name,
    nameError,
    editingId,
    editingName,
    status,
    error,
    feedback,
    isCreating,
    busyCategoryId,
    updateName,
    setEditingName,
    createCategory,
    startEditing,
    cancelEditing,
    saveCategoryName,
    toggleCategory,
    reload,
  } = useCategories(user?.id);

  const canManageCategories = Boolean(user?.id && businessId);

  function handleSubmit(event) {
    event.preventDefault();
    void createCategory();
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.title}>Categorías</h1>

        <p className={styles.description}>Organiza los productos de tu catálogo en categorías.</p>

        {!authLoading && !user && (
          <p className={styles.notice} role="status">
            La gestión de categorías estará disponible cuando inicies sesión.
          </p>
        )}

        {status === "missing-business" && (
          <p className={styles.notice} role="status">
            Primero debes registrar la información de tu negocio.
          </p>
        )}

        <section className={styles.card} aria-labelledby="new-category-title">
          <h2 id="new-category-title" className={styles.sectionTitle}>
            Nueva categoría
          </h2>

          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <div className={styles.field}>
              <label htmlFor="category-name" className={styles.label}>
                Nombre de la categoría
              </label>

              <input
                id="category-name"
                type="text"
                className={styles.input}
                placeholder="Ej. Accesorios"
                value={name}
                onChange={(event) => updateName(event.target.value)}
                disabled={!canManageCategories || isCreating}
                aria-invalid={Boolean(nameError)}
                aria-describedby={nameError ? "category-name-error" : undefined}
                required
              />

              {nameError && (
                <p id="category-name-error" className={styles.error} role="alert">
                  {nameError}
                </p>
              )}
            </div>

            <button
              type="submit"
              className={styles.primaryButton}
              disabled={!canManageCategories || isCreating}
            >
              {isCreating ? "Creando..." : "Crear categoría"}
            </button>
          </form>
        </section>

        <section className={styles.card} aria-labelledby="category-list-title">
          <div className={styles.sectionHeader}>
            <div>
              <h2 id="category-list-title" className={styles.sectionTitle}>
                Categorías registradas
              </h2>

              <p className={styles.sectionDescription}>
                Puedes editar, activar o desactivar cada categoría.
              </p>
            </div>

            {status === "error" && (
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => void reload()}
              >
                Reintentar
              </button>
            )}
          </div>

          {authLoading || status === "loading" ? (
            <p className={styles.stateMessage} role="status">
              Cargando categorías...
            </p>
          ) : null}

          {error && (
            <p className={styles.errorMessage} role="alert">
              {error}
            </p>
          )}

          {feedback && (
            <p className={styles.successMessage} role="status">
              {feedback}
            </p>
          )}

          {status === "ready" && categories.length === 0 && (
            <p className={styles.stateMessage}>Aún no tienes categorías registradas.</p>
          )}

          {categories.length > 0 && (
            <ul className={styles.categoryList}>
              {categories.map((category) => {
                const isBusy = busyCategoryId === category.id;
                const isEditing = editingId === category.id;

                return (
                  <li key={category.id} className={styles.categoryItem}>
                    {isEditing ? (
                      <div className={styles.editArea}>
                        <label
                          htmlFor={`category-${category.id}`}
                          className={styles.visuallyHidden}
                        >
                          Editar nombre de {category.name}
                        </label>

                        <input
                          id={`category-${category.id}`}
                          type="text"
                          className={styles.input}
                          value={editingName}
                          onChange={(event) => setEditingName(event.target.value)}
                          disabled={isBusy}
                        />

                        <div className={styles.itemActions}>
                          <button
                            type="button"
                            className={styles.primarySmallButton}
                            onClick={() => void saveCategoryName()}
                            disabled={isBusy}
                          >
                            {isBusy ? "Guardando..." : "Guardar"}
                          </button>

                          <button
                            type="button"
                            className={styles.secondaryButton}
                            onClick={cancelEditing}
                            disabled={isBusy}
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div>
                          <p className={styles.categoryName}>{category.name}</p>

                          <span
                            className={
                              category.active ? styles.activeStatus : styles.inactiveStatus
                            }
                          >
                            {category.active ? "Activa" : "Inactiva"}
                          </span>
                        </div>

                        <div className={styles.itemActions}>
                          <button
                            type="button"
                            className={styles.secondaryButton}
                            onClick={() => startEditing(category)}
                            disabled={isBusy}
                          >
                            Editar
                          </button>

                          <button
                            type="button"
                            className={styles.secondaryButton}
                            onClick={() => void toggleCategory(category)}
                            disabled={isBusy}
                          >
                            {isBusy
                              ? "Actualizando..."
                              : category.active
                                ? "Desactivar"
                                : "Activar"}
                          </button>
                        </div>
                      </>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
