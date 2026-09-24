"use client";

import { useState } from "react";

import { useAuth } from "@/hooks/useAuth";
import { useProducts } from "@/hooks/useProducts";
import { validateProduct } from "@/utils/validateProduct";

import styles from "./Products.module.css";

const initialValues = {
  name: "",
  categoryId: "",
  description: "",
  price: "",
  imageUrl: "",
};

function formatPrice(price) {
  return new Intl.NumberFormat("es-SV", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

export default function ProductsPage() {
  const { user, loading: authLoading } = useAuth();
  const ownerId = user?.id ?? null;

  const {
    business,
    plan,
    categories,
    products,
    loading,
    error,
    createProduct,
    updateProduct,
    setProductActive,
  } = useProducts(ownerId);

  const [values, setValues] = useState(initialValues);
  const [formErrors, setFormErrors] = useState({});
  const [editingProductId, setEditingProductId] = useState(null);
  const [changingProductId, setChangingProductId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState("");

  function updateField(event) {
    const { name, value } = event.target;

    setValues((previousValues) => ({
      ...previousValues,
      [name]: value,
    }));

    setFormErrors((previousErrors) => ({
      ...previousErrors,
      [name]: "",
    }));

    setFeedback("");
  }

  function resetForm() {
    setValues(initialValues);
    setFormErrors({});
    setEditingProductId(null);
  }

  function startEditing(product) {
    setValues({
      name: product.name,
      categoryId: product.categoryId,
      description: product.description,
      price: String(product.price),
      imageUrl: product.imageUrl ?? "",
    });

    setEditingProductId(product.id);
    setFormErrors({});
    setFeedback("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const validationErrors = validateProduct(values);

    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      return;
    }

    setSaving(true);
    setFeedback("");

    try {
      if (editingProductId) {
        await updateProduct(editingProductId, values);
        setFeedback("Producto actualizado correctamente.");
      } else {
        await createProduct(values);
        setFeedback("Producto creado correctamente.");
      }

      resetForm();
    } catch (submitError) {
      setFeedback(
        submitError instanceof Error ? submitError.message : "No se pudo guardar el producto."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleActiveChange(product) {
    setChangingProductId(product.id);
    setFeedback("");

    try {
      await setProductActive(product.id, !product.active);

      setFeedback(
        product.active ? "Producto desactivado correctamente." : "Producto activado correctamente."
      );
    } catch (activeError) {
      setFeedback(
        activeError instanceof Error
          ? activeError.message
          : "No se pudo cambiar el estado del producto."
      );
    } finally {
      setChangingProductId(null);
    }
  }

  if (authLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <p className={styles.status}>Comprobando tu sesión...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <h1 className={styles.title}>Productos</h1>
          <p className={styles.status}>
            La gestión de productos estará disponible cuando inicies sesión.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <p className={styles.status}>Cargando productos...</p>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <h1 className={styles.title}>Productos</h1>
          <p className={styles.status}>
            Primero debes configurar la información de tu emprendimiento.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Productos</h1>
            <p className={styles.description}>
              Administra los productos publicados por <strong>{business.name}</strong>.
            </p>
          </div>
        </header>

        {error ? <p className={styles.errorBanner}>{error}</p> : null}

        <section className={styles.card} aria-labelledby="product-form-title">
          <h2 id="product-form-title" className={styles.sectionTitle}>
            {editingProductId ? "Editar producto" : "Agregar producto"}
          </h2>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.fields}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="product-name">
                  Nombre
                </label>
                <input
                  className={styles.input}
                  id="product-name"
                  name="name"
                  type="text"
                  value={values.name}
                  onChange={updateField}
                  disabled={saving}
                />
                {formErrors.name ? <p className={styles.fieldError}>{formErrors.name}</p> : null}
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="product-category">
                  Categoría
                </label>
                <select
                  className={styles.input}
                  id="product-category"
                  name="categoryId"
                  value={values.categoryId}
                  onChange={updateField}
                  disabled={saving}
                >
                  <option value="">Selecciona una categoría</option>

                  {categories.map((category) => (
                    <option key={category.id} value={category.id} disabled={!category.active}>
                      {category.name}
                      {!category.active ? " (inactiva)" : ""}
                    </option>
                  ))}
                </select>

                {formErrors.categoryId ? (
                  <p className={styles.fieldError}>{formErrors.categoryId}</p>
                ) : null}
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="product-price">
                  Precio
                </label>
                <input
                  className={styles.input}
                  id="product-price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={values.price}
                  onChange={updateField}
                  disabled={saving}
                />

                {formErrors.price ? <p className={styles.fieldError}>{formErrors.price}</p> : null}
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="product-image">
                  URL de la imagen
                </label>
                <input
                  className={styles.input}
                  id="product-image"
                  name="imageUrl"
                  type="url"
                  placeholder="https://..."
                  value={values.imageUrl}
                  onChange={updateField}
                  disabled={saving}
                />

                {formErrors.imageUrl ? (
                  <p className={styles.fieldError}>{formErrors.imageUrl}</p>
                ) : (
                  <p className={styles.helper}>
                    Por ahora utilizaremos una URL. Después conectaremos la carga de imágenes.
                  </p>
                )}
              </div>

              <div className={`${styles.field} ${styles.fullWidth}`}>
                <label className={styles.label} htmlFor="product-description">
                  Descripción
                </label>
                <textarea
                  className={styles.textarea}
                  id="product-description"
                  name="description"
                  rows="5"
                  value={values.description}
                  onChange={updateField}
                  disabled={saving}
                />

                {formErrors.description ? (
                  <p className={styles.fieldError}>{formErrors.description}</p>
                ) : null}
              </div>
            </div>

            <div className={styles.actions}>
              <button
                className={styles.primaryButton}
                type="submit"
                disabled={saving || categories.length === 0}
              >
                {saving
                  ? "Guardando..."
                  : editingProductId
                    ? "Guardar cambios"
                    : "Agregar producto"}
              </button>

              {editingProductId ? (
                <button
                  className={styles.secondaryButton}
                  type="button"
                  onClick={resetForm}
                  disabled={saving}
                >
                  Cancelar edición
                </button>
              ) : null}
            </div>

            {categories.length === 0 ? (
              <p className={styles.notice}>
                Necesitas crear al menos una categoría antes de agregar productos.
              </p>
            ) : null}

            {feedback ? <p className={styles.feedback}>{feedback}</p> : null}
          </form>
        </section>

        <section className={styles.card} aria-labelledby="product-list-title">
          <h2 id="product-list-title" className={styles.sectionTitle}>
            Productos registrados
          </h2>

          {plan ? (
            <p className={styles.planSummary}>
              Plan {plan.name}: {products.filter((product) => product.active).length} de{" "}
              {plan.maxActiveProducts} productos activos.
            </p>
          ) : (
            <p className={styles.notice}>
              El emprendimiento todavía no tiene un plan disponible. Puedes editar y desactivar
              productos, pero no activarlos.
            </p>
          )}

          {products.length === 0 ? (
            <p className={styles.empty}>Todavía no has registrado productos.</p>
          ) : (
            <div className={styles.productGrid}>
              {products.map((product) => (
                <article className={styles.product} key={product.id}>
                  {product.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      className={styles.productImage}
                      src={product.imageUrl}
                      alt={product.name}
                    />
                  ) : (
                    <div className={styles.imagePlaceholder}>Sin imagen</div>
                  )}

                  <div className={styles.productContent}>
                    <div className={styles.productHeading}>
                      <h3 className={styles.productName}>{product.name}</h3>

                      <span className={product.active ? styles.activeBadge : styles.inactiveBadge}>
                        {product.active ? "Activo" : "Inactivo"}
                      </span>
                    </div>

                    <p className={styles.productDescription}>{product.description}</p>

                    <strong className={styles.price}>{formatPrice(product.price)}</strong>

                    <div className={styles.productActions}>
                      <button
                        className={styles.editButton}
                        type="button"
                        onClick={() => startEditing(product)}
                        disabled={changingProductId === product.id}
                      >
                        Editar
                      </button>

                      <button
                        className={product.active ? styles.dangerButton : styles.toggleButton}
                        type="button"
                        onClick={() => handleActiveChange(product)}
                        disabled={
                          changingProductId === product.id || (!product.active && !plan?.active)
                        }
                        title={
                          !product.active && !plan?.active
                            ? "Se necesita un plan activo para activar productos."
                            : undefined
                        }
                      >
                        {changingProductId === product.id
                          ? "Actualizando..."
                          : product.active
                            ? "Desactivar"
                            : "Activar"}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
