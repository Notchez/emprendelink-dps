import Link from "next/link";
import styles from "./KpiCard.module.css";

export default function KpiCard({ title, value, href }) {
  const content = (
    <>
      <h3>{title}</h3>
      <p>{value}</p>
      {href && <span className={styles.detail}>Ver detalle →</span>}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={`${styles.card} ${styles.linkCard}`}>
        {content}
      </Link>
    );
  }

  return <article className={styles.card}>{content}</article>;
}
