import styles from "./PlansList.module.css";

export default function PlansList({ plans }) {
     if (plans.length === 0) {
    return (
      <section>
        <h2>Planes disponibles</h2>
        <p>No hay planes disponibles.</p>
      </section>
    );
  }
  return (
    <section>
      <h2>Planes disponibles</h2>

      <div className={styles.plansGrid}>
        {plans.map((plan) => (
          <article key={plan.id} className={styles.card}>
            <h3>{plan.name}</h3>

            <p>
              Máximo de productos activos: {plan.maxActiveProducts}
            </p>

            <p>
              Comisión: {Math.round(plan.commissionRate * 100)}%
            </p>

            <p>
              Estado: {plan.active ? "Activo" : "Inactivo"}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}