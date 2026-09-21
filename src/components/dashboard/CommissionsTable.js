import styles from "./CommissionsTable.module.css";

export default function CommissionsTable({ commissions }) {
  if (commissions.length === 0) {
    return <p>No hay comisiones registradas.</p>;
  }

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Comisión</th>
            <th>Pedido</th>
            <th>Fecha</th>
            <th>Tasa</th>
            <th>Monto</th>
          </tr>
        </thead>

        <tbody>
          {commissions.map((commission) => (
            <tr key={commission.id}>
              <td>{commission.id}</td>
              <td>{commission.orderId}</td>
              <td>{commission.createdAt}</td>
              <td>{Math.round(commission.rate * 100)}%</td>
              <td>${commission.amount.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}