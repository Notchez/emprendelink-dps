import styles from "./KpiCard.module.css";

export default function KpiCard({ title, value }) {
  return (
    <article className={styles.card}>
      <h3>{title}</h3>
      <p>{value}</p>
    </article>
  );
}