"use client";

import { useEffect, useState } from "react";
import { planService } from "@/services/planService";
import styles from "./PlansManager.module.css";

const emptyForm = {
  id: "",
  name: "",
  maxActiveProducts: "",
  commissionRate: "3",
  active: true,
};

export default function PlansManager() {
  const [plans, setPlans] = useState([]);
  const [values, setValues] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");

  async function loadPlans() {
    setLoading(true);
    setError("");
    try {
      setPlans(await planService.getPlans());
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "No se pudieron cargar los planes.");
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
        const nextPlans = await planService.getPlans();
        if (!cancelled) setPlans(nextPlans);
      } catch (caughtError) {
        if (!cancelled) {
          setError(caughtError instanceof Error ? caughtError.message : "No se pudieron cargar los planes.");
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

  function updateField(event) {
    const { name, value, type, checked } = event.target;
    setValues((previous) => ({ ...previous, [name]: type === "checkbox" ? checked : value }));
    setError("");
    setFeedback("");
  }

  function resetForm() {
    setValues(emptyForm);
    setEditingId(null);
    setError("");
    setFeedback("");
  }

  function editPlan(plan) {
    setEditingId(plan.id);
    setValues({
      id: plan.id,
      name: plan.name,
      maxActiveProducts: String(plan.maxActiveProducts),
      commissionRate: String(Math.round(plan.commissionRate * 100)),
      active: plan.active,
    });
    setError("");
    setFeedback("");
  }

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setFeedback("");

    try {
      let message;
      if (editingId) {
        await planService.update(editingId, values);
        message = "Plan actualizado correctamente.";
      } else {
        await planService.create(values);
        message = "Plan creado correctamente.";
      }
      resetForm();
      setFeedback(message);
      await loadPlans();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "No se pudo guardar el plan.");
    } finally {
      setSaving(false);
    }
  }

  async function togglePlan(plan) {
    setSaving(true);
    setError("");
    setFeedback("");
    try {
      await planService.setActive(plan.id, !plan.active);
      setFeedback(plan.active ? "Plan desactivado correctamente." : "Plan activado correctamente.");
      await loadPlans();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "No se pudo cambiar el estado.");
    } finally {
      setSaving(false);
    }
  }

  async function seedDefaults() {
    setSaving(true);
    setError("");
    setFeedback("");
    try {
      await planService.seedDefaults();
      setFeedback("Planes base creados correctamente.");
      await loadPlans();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "No se pudieron crear los planes base.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.wrapper}>
      <section className={styles.card} aria-labelledby="plan-form-title">
        <div className={styles.header}>
          <div>
            <h2 id="plan-form-title">{editingId ? "Editar plan" : "Crear plan"}</h2>
            <p>Define el límite de productos y la comisión del emprendimiento.</p>
          </div>
          {plans.length === 0 ? (
            <button type="button" className={styles.secondaryButton} onClick={() => void seedDefaults()} disabled={saving}>
              Crear planes base
            </button>
          ) : null}
        </div>

        <form className={styles.form} onSubmit={submit}>
          <label>
            Identificador
            <input name="id" value={values.id} onChange={updateField} disabled={saving || Boolean(editingId)} placeholder="plan-basic" required />
          </label>
          <label>
            Nombre
            <input name="name" value={values.name} onChange={updateField} disabled={saving} placeholder="Básico" required />
          </label>
          <label>
            Productos activos
            <input name="maxActiveProducts" type="number" min="1" step="1" value={values.maxActiveProducts} onChange={updateField} disabled={saving} required />
          </label>
          <label>
            Comisión (%)
            <input name="commissionRate" type="number" min="0" max="100" step="0.01" value={values.commissionRate} onChange={updateField} disabled={saving} required />
          </label>
          <label className={styles.checkbox}>
            <input name="active" type="checkbox" checked={values.active} onChange={updateField} disabled={saving} />
            Plan activo
          </label>
          <div className={styles.actions}>
            <button type="submit" className={styles.primaryButton} disabled={saving}>
              {saving ? "Guardando..." : editingId ? "Guardar cambios" : "Crear plan"}
            </button>
            {editingId ? (
              <button type="button" className={styles.secondaryButton} onClick={resetForm} disabled={saving}>
                Cancelar
              </button>
            ) : null}
          </div>
        </form>

        {error ? <p className={styles.error} role="alert">{error}</p> : null}
        {feedback ? <p className={styles.success} role="status">{feedback}</p> : null}
      </section>

      <section className={styles.card} aria-labelledby="plan-list-title">
        <div className={styles.header}>
          <div>
            <h2 id="plan-list-title">Planes registrados</h2>
            <p>Estos son los planes que los emprendedores pueden seleccionar.</p>
          </div>
          <button type="button" className={styles.secondaryButton} onClick={() => void loadPlans()} disabled={loading || saving}>
            Actualizar
          </button>
        </div>
        {loading ? <p role="status">Cargando planes...</p> : null}
        {!loading && plans.length === 0 ? <p>No hay planes registrados. Crea los planes base para comenzar.</p> : null}
        <div className={styles.grid}>
          {plans.map((plan) => (
            <article className={styles.plan} key={plan.id}>
              <div className={styles.planHeader}>
                <h3>{plan.name}</h3>
                <span className={plan.active ? styles.active : styles.inactive}>{plan.active ? "Activo" : "Inactivo"}</span>
              </div>
              <p>{plan.maxActiveProducts} productos activos</p>
              <p>Comisión: {Math.round(plan.commissionRate * 100)}%</p>
              <div className={styles.actions}>
                <button type="button" className={styles.secondaryButton} onClick={() => editPlan(plan)} disabled={saving}>Editar</button>
                <button type="button" className={styles.secondaryButton} onClick={() => void togglePlan(plan)} disabled={saving}>{plan.active ? "Desactivar" : "Activar"}</button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
