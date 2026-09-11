import styles from "./ModuleCard.module.css";

export function ModuleCard({ title, owner, description }) {
  return (
    <article className={styles.card}>
      <p className={styles.owner}>{owner}</p>
      <h2>{title}</h2>
      <p>{description}</p>
    </article>
  );
}
